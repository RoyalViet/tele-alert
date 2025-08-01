import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import { sendNotification } from "../services/telegram/telegramService";

interface TransactionEvent {
  transaction_id: string;
  receipt_id: string;
  direction: string;
  sender: string;
  receiver: string;
  type: string;
  transaction_type: string;
  token: string;
  amount: string;
  amount_numeric: string;
  timestamp: number;
  block_height: string;
  index: number;
  transaction_view: {
    type?: string;
    amount?: number;
    sender: string;
    receiver: string;
    timestamp: number;
    transaction_type: string;
    token_in?: string;
    token_out?: string;
    amount_in?: string;
    amount_out?: string;
    usd_value?: string;
    contract?: string;
    amountInBigDecimal?: number;
    amountOutBigDecimal?: number;
    [key: string]: any;
  };
  [key: string]: any;
}

interface SwapStep {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  usdValue?: string;
}

interface GroupedSwapTransaction {
  transaction_id: string;
  timestamp: number;
  sender: string;
  receiver: string;
  block_height: string;
  swapSteps: SwapStep[];
}

const TRANSITION_IDS_FILE = path.join(__dirname, "../seeds/transitionIds.json");
const MAX_STORED_IDS = 100; // Maximum number of IDs to keep in the array

// ?type=&limit=30&offset=0&filters=&eventTypes=&nearMinAmount=0
class PikespeakMonitor {
  private readonly apiUrl =
    "https://pikespeak.ai/api/event-historic/account/csp88.near";
  private readonly headers = {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    pragma: "no-cache",
    priority: "u=1, i",
    referer: "https://pikespeak.ai/wallet-explorer/csp88.near/events",
    "sec-ch-ua":
      '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
    "sec-ch-ua-arch": "arm",
    "sec-ch-ua-bitness": "64",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "macOS",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
  };

  /**
   * Load existing transaction IDs from file
   */
  private loadTransitionIds(): string[] {
    try {
      if (fs.existsSync(TRANSITION_IDS_FILE)) {
        const data = fs.readFileSync(TRANSITION_IDS_FILE, "utf8");
        return JSON.parse(data);
      }
      return [];
    } catch (error) {
      console.error("Error loading transition IDs:", error);
      return [];
    }
  }

  /**
   * Save transaction IDs to file
   */
  private saveTransitionIds(ids: string[]): void {
    try {
      // Keep only the latest MAX_STORED_IDS
      const trimmedIds = ids.slice(0, MAX_STORED_IDS);
      fs.writeFileSync(
        TRANSITION_IDS_FILE,
        JSON.stringify(trimmedIds, null, 2)
      );
    } catch (error) {
      console.error("Error saving transition IDs:", error);
    }
  }

  /**
   * Fetch data from Pikespeak API
   */
  private async fetchApiData(): Promise<TransactionEvent[]> {
    try {
      const params = {
        type: "",
        limit: 30,
        offset: 0,
        filters: "",
        eventTypes: "",
        nearMinAmount: 0,
      };

      const response = await axios.get<TransactionEvent[]>(this.apiUrl, {
        headers: this.headers,
        params,
      });

      return response.data || [];
    } catch (error) {
      console.error("Error fetching API data:", error);

      // Send error notification to Telegram
      const errorMessage = `
❌ <b>Pikespeak API Error</b>

⚠️ <b>Error:</b> Failed to fetch data from Pikespeak API
🕐 <b>Time:</b> ${new Date().toLocaleString("vi-VN")}
📋 <b>Details:</b> ${error instanceof Error ? error.message : "Unknown error"}

🔧 Please check the API status or network connection.
      `.trim();

      try {
        await sendNotification(errorMessage);
      } catch (telegramError) {
        console.error(
          "Failed to send error notification to Telegram:",
          telegramError
        );
      }

      throw error;
    }
  }

  /**
   * Format transaction data for Telegram message
   */
  private formatTelegramMessage(transaction: TransactionEvent): string {
    const timestamp = transaction.timestamp
      ? new Date(transaction.timestamp).toLocaleString("vi-VN")
      : "N/A";

    const amount = transaction.amount_numeric || transaction.amount || "N/A";
    const sender = transaction.sender || "Unknown";
    const receiver = transaction.receiver || "Unknown";
    const type = transaction.type || transaction.transaction_type || "Unknown";

    return `
🔄 <b>New SWAP Transaction Detected!</b>

📊 <b>Transaction ID:</b> <code>${transaction.transaction_id}</code>
📋 <b>Receipt ID:</b> <code>${transaction.receipt_id}</code>
💰 <b>Amount:</b> ${amount}
📤 <b>Sender:</b> ${sender}
📥 <b>Receiver:</b> ${receiver}
� <b>Direction:</b> ${transaction.direction}
🏷️ <b>Type:</b> ${type}
⏰ <b>Time:</b> ${timestamp}
� <b>Block:</b> ${transaction.block_height}

<a href="https://pikespeak.ai/wallet-explorer/${receiver}/events">View on Pikespeak</a>
    `.trim();
  }

  /**
   * Group SWAP transactions by transaction_id and combine their steps
   */
  private groupSwapTransactions(
    transactions: TransactionEvent[]
  ): GroupedSwapTransaction[] {
    const swapGroups = new Map<string, GroupedSwapTransaction>();

    transactions.forEach((tx) => {
      if (tx.transaction_type === "SWAP" && tx.transaction_view) {
        const txId = tx.transaction_id;

        if (!swapGroups.has(txId)) {
          swapGroups.set(txId, {
            transaction_id: txId,
            timestamp: tx.timestamp,
            sender: tx.sender,
            receiver: tx.receiver,
            block_height: tx.block_height,
            swapSteps: [],
          });
        }

        const group = swapGroups.get(txId)!;
        const view = tx.transaction_view;

        if (
          view.token_in &&
          view.token_out &&
          view.amount_in &&
          view.amount_out
        ) {
          group.swapSteps.push({
            tokenIn: this.getTokenSymbol(view.token_in),
            tokenOut: this.getTokenSymbol(view.token_out),
            amountIn: this.formatAmount(view.amount_in),
            amountOut: this.formatAmount(view.amount_out),
            usdValue: view.usd_value,
          });
        }
      }
    });

    return Array.from(swapGroups.values());
  }

  /**
   * Get simplified token symbol from token address
   */
  private getTokenSymbol(tokenAddress: string): string {
    const tokenMap: { [key: string]: string } = {
      "token.rhealab.near": "RHEA",
      "wrap.near": "WNEAR",
      "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": "USDT.e",
      "usdt.tether-token.near": "USDT",
      "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1":
        "USDC",
    };

    return tokenMap[tokenAddress] || tokenAddress.substring(0, 8) + "...";
  }

  /**
   * Format amount to readable format
   */
  private formatAmount(amount: string | number): string {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    if (num >= 1000) {
      return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
    }
    return num.toFixed(2);
  }

  /**
   * Format grouped SWAP transaction for Telegram message
   */
  private formatGroupedSwapMessage(groupedTx: GroupedSwapTransaction): string {
    const timestamp = new Date(groupedTx.timestamp).toLocaleString("vi-VN");

    // Format swap steps
    const swapStepsText = groupedTx.swapSteps
      .map(
        (step) =>
          `• -${step.amountIn} ${step.tokenIn} → +${step.amountOut} ${step.tokenOut}`
      )
      .join("\n");

    // Calculate total USD value if available
    const totalUsdValue = groupedTx.swapSteps.reduce((sum, step) => {
      const usd = step.usdValue ? parseFloat(step.usdValue) : 0;
      return sum + usd;
    }, 0);

    const usdValueText =
      totalUsdValue > 0
        ? `\n💵 <b>Total Value:</b> ~$${totalUsdValue.toFixed(2)}`
        : "";

    return `
🔄 <b>New SWAP Transaction Detected!</b>

📊 <b>Transaction ID:</b> <code>${groupedTx.transaction_id}</code>
👤 <b>Sender:</b> ${groupedTx.sender}
🏢 <b>Contract:</b> ${groupedTx.receiver}
⏰ <b>Time:</b> ${timestamp}
🏗️ <b>Block:</b> ${groupedTx.block_height}${usdValueText}

🔀 <b>Swap Details:</b>
${swapStepsText}

<a href="https://pikespeak.ai/wallet-explorer/${groupedTx.sender}/events">View on Pikespeak</a>
    `.trim();
  }

  /**
   * Check for new SWAP transactions and send notifications
   */
  public async checkAndNotify(): Promise<void> {
    try {
      console.log("🔍 Checking for new SWAP transactions...");

      // Load existing transaction IDs
      const existingIds = this.loadTransitionIds();

      // Fetch latest data from API
      const transactions = await this.fetchApiData();

      // console.log(`📊 Total transactions fetched: ${transactions.length}`);

      // Log all transaction types for debugging
      const transactionTypes = transactions.map((tx) => ({
        id: tx.transaction_id,
        type: tx.type,
        transaction_type: tx.transaction_type,
        index: tx.index,
      }));
      // console.log("📋 Transaction types found:", transactionTypes);

      // Group SWAP transactions by transaction_id
      const groupedSwapTransactions = this.groupSwapTransactions(transactions);

      console.log(
        `Found ${groupedSwapTransactions.length} grouped SWAP transactions`
      );

      // Check for new transaction IDs (only check once per transaction_id)
      const newTransactions = groupedSwapTransactions.filter(
        (tx) => !existingIds.includes(tx.transaction_id)
      );

      if (newTransactions.length > 0) {
        console.log(
          `🚨 Found ${newTransactions.length} new SWAP transaction(s)!`
        );

        // Send notifications for each new grouped transaction
        for (const transaction of newTransactions) {
          try {
            const message = this.formatGroupedSwapMessage(transaction);
            await sendNotification(message);
            console.log(
              `✅ Notification sent for transaction: ${transaction.transaction_id}`
            );
          } catch (error) {
            console.error(
              `❌ Failed to send notification for transaction ${transaction.transaction_id}:`,
              error
            );
          }
        }

        // Update the stored IDs
        const newIds = newTransactions.map((tx) => tx.transaction_id);
        const updatedIds = [...newIds, ...existingIds];

        // Remove duplicates and trim to max size
        const uniqueIds = [...new Set(updatedIds)];

        this.saveTransitionIds(uniqueIds);
        console.log(
          `💾 Updated transition IDs file with ${newIds.length} new IDs`
        );
      } else {
        console.log("✅ No new SWAP transactions found");
      }
    } catch (error) {
      console.error("❌ Error in checkAndNotify:", error);

      // Send general error notification to Telegram
      const errorMessage = `
❌ <b>Pikespeak Monitor Error</b>

⚠️ <b>Error:</b> Error occurred while checking for new SWAP transactions
🕐 <b>Time:</b> ${new Date().toLocaleString("vi-VN")}
📋 <b>Details:</b> ${error instanceof Error ? error.message : "Unknown error"}

🤖 The monitor will continue checking in the next cycle.
      `.trim();

      try {
        await sendNotification(errorMessage);
      } catch (telegramError) {
        console.error(
          "Failed to send general error notification to Telegram:",
          telegramError
        );
      }
    }
  }
}

export default PikespeakMonitor;
