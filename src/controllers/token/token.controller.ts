import httpStatusCodes from "http-status-codes";
import axios from "axios";
import fs from "fs";
import path from "path";

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
import { bignumber } from "mathjs";

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

const txnFilePath = path.join(
  process.cwd(),
  "src",
  "controllers",
  "token",
  "txn.json"
);

const readTxnList = (): Record<
  string,
  { txn: string; txnTabToken: string }
> => {
  if (fs.existsSync(txnFilePath)) {
    const data = fs.readFileSync(txnFilePath, "utf-8");
    return JSON.parse(data);
  }
  return {};
};

const writeTxnList = (txnMap: any) => {
  fs.writeFileSync(txnFilePath, JSON.stringify(txnMap, null, 2), "utf-8");
};

const idTxnMap = readTxnList();
export async function getFirstTransactionAction(wallet: string) {
  console.log(
    `Running cron job for wallet: ${String(wallet).slice(0, 20)} ...`
  );

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

    if (transactions?.length > 0) {
      const firstTransaction = transactions[0];
      const currentId = firstTransaction?.id;

      if (
        idTxnMap[wallet].txn !== currentId &&
        bigNumber(firstTransaction?.actions?.[0]?.deposit)
          .dividedBy(Math.pow(10, 24))
          .gt(1)
      ) {
        idTxnMap[wallet].txn = currentId;
        writeTxnList(idTxnMap);
        handlePushTelegramNotificationController({
          body: generateTelegramHTML({
            id: currentId,
            signer_account_id: firstTransaction?.signer_account_id,
            receiver_account_id: firstTransaction?.receiver_account_id,
            transaction_hash: `https://nearblocks.io/txns/${firstTransaction?.transaction_hash}`,
            NearBlockLink: `https://nearblocks.io/address/${wallet}?tab=txns`,
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
    console.error("Error getFirstTransactionAction fetching data txns");
  }
}
export async function getFirstTxnTokenAction(wallet: string) {
  console.log(
    `Running cron job for wallet txn: ${String(wallet).slice(0, 20)} ...`
  );

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

    if (transactions?.length > 0) {
      const firstTransaction = transactions[0];
      const currentId = firstTransaction?.transaction_hash || "";

      if (
        idTxnMap[wallet]?.txnTabToken !== currentId &&
        String(firstTransaction?.delta_amount).startsWith("-")
      ) {
        idTxnMap[wallet].txnTabToken = currentId;
        writeTxnList(idTxnMap);
        if (
          wallet === "stasiey.near" &&
          ["ABG", "SOL", "PURGE"].includes(firstTransaction?.ft?.symbol)
        ) {
          return;
        }
        handlePushTelegramNotificationController({
          body: generateTelegramHTML({
            transaction_hash: `https://nearblocks.io/address/${wallet}?tab=tokentxns`,
            affected_account_id: firstTransaction?.affected_account_id,
            involved_account_id: firstTransaction?.involved_account_id,
            token: firstTransaction?.ft?.symbol,
            balance: formatBalance(
              bigNumber(firstTransaction?.delta_amount).dividedBy(
                Math.pow(10, firstTransaction?.ft?.decimals || 6)
              )
            ),
          }),
        });
      }
    } else {
      console.log("No transactions found.");
    }
  } catch (error) {
    console.error(
      "Error getFirstTxnTokenAction fetching data txns ",
      error?.message
    );
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
