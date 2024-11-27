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
import { generateTelegramHTML } from "../../common/helper/common.helper";

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

let count = 0;
export async function fetchFirstTransaction() {
  try {
    const response = await axios.get(
      "https://nearblocks.io/_next/data/nearblocks/en/address/e0xa477.near.json?id=e0xa477.near&tab=txns",
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
      if (firstTransaction?.id !== "2777248798" && count === 0) {
        count++;
        handlePushTelegramNotificationController({
          body: generateTelegramHTML({
            id: firstTransaction?.id,
            signer_account_id: firstTransaction?.signer_account_id,
            receiver_account_id: firstTransaction?.receiver_account_id,
            transaction_hash: `https://nearblocks.io/txns/${firstTransaction?.transaction_hash}`,
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
