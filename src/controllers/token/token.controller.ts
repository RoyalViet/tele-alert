import httpStatusCodes from "http-status-codes";
import axios from "axios";

// Interfaces
import IController from "../../interfaces/IController";
import { ICreateToken } from "../../interfaces/token.interface";

// Services
import * as tokenService from "../../services/token/token.service";

// Utilities
import ApiResponse from "../../utilities/api-response.utility";
import { formatBalance } from "../../common/helper/bigNumber";
import { bigNumber } from "../../common/helper/bigNumber";
import { handlePushTelegramNotificationController } from "../common/homepageController";
import { delay, generateTelegramHTML } from "../../common/helper/common.helper";

export const createTokenController: IController = async (req, res) => {
  try {
    const params: ICreateToken = {
      liq: req.body.liq,
      token_account_ids: req.body.token_account_ids,
      token_price: req.body.token_price,
      token_symbols: req.body.token_symbols,
      pool_id: req.body.pool_id,
      token_contract: req.body.token_contract,
    };
    const token = await tokenService.createToken(params);
    return ApiResponse.result(res, token, httpStatusCodes.CREATED);
  } catch (e) {
    return ApiResponse.error(res, httpStatusCodes.BAD_REQUEST);
  }
};

const idTxnMap: Record<string, string> = {
  "e0xa477.near": "2794540134",
  "root.near": "2789161353",
  "142_37is.near": "2789161353",
  "seriousfarmer.near": "2788908889",
  "4a15a7be78f0cc85772d96000cd9a7c8bbcefdf3e5a1629850c9596f2d88cd83":
    "2794547423",
};
const idTxnTokenMap: Record<string, string> = {
  "e0xa477.near": "ARAwTbXuaUMVXYEipwnTPjT4grpWVA4ooHMKS1EU1Hyv",
  "root.near": "4TT1GnareFy7awfZu4nZ9zx91E2rAyiMSLHoJF26iJj1",
  "142_37is.near": "",
  "seriousfarmer.near": "ACupB9nEhBpqE4bQGFthfFTAn3kbShtrSCeXpUjvSLob",
  "4a15a7be78f0cc85772d96000cd9a7c8bbcefdf3e5a1629850c9596f2d88cd83":
    "6Hev9xZAVVhze2okbaiKVYsjYYFf9GTaoEh86G9rcqZe",
};

export async function getFirstTransactionAction(wallet: string) {
  console.log(`Running cron job for wallet: ${wallet} ...`);

  try {
    const response = await axios.get(
      `https://nearblocks.io/_next/data/nearblocks/en/address/${wallet}.json?id=${wallet}&tab=txns`,
      {
        headers: {
          accept: "*/*",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        },
      }
    );

    const transactions = response?.data?.pageProps?.data?.txns;

    if (transactions.length > 0) {
      const firstTransaction = transactions[0];
      const currentId = firstTransaction?.id;

      if (idTxnMap[wallet] !== currentId) {
        idTxnMap[wallet] = currentId;
        handlePushTelegramNotificationController({
          body: generateTelegramHTML({
            id: currentId,
            signer_account_id: firstTransaction?.signer_account_id,
            receiver_account_id: firstTransaction?.receiver_account_id,
            transaction_hash: `https://nearblocks.io/txns/${firstTransaction?.transaction_hash}`,
            dexLink: `https://nearblocks.io/address/${wallet}?tab=txns`,
            balance: formatBalance(
              bigNumber(firstTransaction?.actions?.[0]?.deposit).dividedBy(
                Math.pow(10, 24)
              )
            ),
          }),
        });
      }
    } else {
      console.log("No transactions found.");
    }
  } catch (error) {
    console.error("Error fetching data txns");
  }
}
export async function getFirstTxnTokenAction(wallet: string) {
  console.log(`Running cron job for wallet txn: ${wallet} ...`);

  try {
    const response = await axios.get(
      `https://nearblocks.io/_next/data/nearblocks/en/address/${wallet}.json?id=${wallet}&tab=tokentxns`,
      {
        headers: {
          accept: "*/*",
          "user-agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        },
      }
    );

    const transactions = response?.data?.pageProps?.data?.txns;

    if (transactions.length > 0) {
      const firstTransaction = transactions[0];
      const currentId = firstTransaction?.transaction_hash || "";

      if (idTxnTokenMap[wallet] !== currentId) {
        idTxnTokenMap[wallet] = currentId;
        handlePushTelegramNotificationController({
          body: generateTelegramHTML({
            transaction_hash: `https://nearblocks.io/address/${wallet}?tab=tokentxns`,
          }),
        });
      }
    } else {
      console.log("No transactions found.");
    }
  } catch (error) {
    console.error("Error fetching data txns");
  }
}

export async function getFirstTransaction() {
  for (const key in idTxnMap) {
    if (idTxnMap.hasOwnProperty(key)) {
      await delay(Math.random() * 500);
      await getFirstTransactionAction(key);
      await delay(Math.random() * 500);
      await getFirstTxnTokenAction(key);
    }
  }
}
