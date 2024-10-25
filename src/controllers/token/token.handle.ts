import axios from "axios";
// Interfaces
import { ICreateToken } from "../../interfaces/token.interface";

// Services
import * as tokenService from "../../services/token/token.service";
import * as telegramService from "../../services/telegram/telegramService";
import { formatBalance } from "../../common/helper/bigNumber";
import { contract } from "../../cron/pool-token.cron";
import { generateTelegramMarkdown } from "../../common/helper/common.helper";

// Utilities

export const createTokenHandle = async (params: ICreateToken) => {
  try {
    const token = await tokenService.createToken(params);
  } catch (e) {
    //
  }
};

const telegramAlertToken = async (params: ICreateToken) => {
  try {
    await telegramService.sendNotification(
      generateTelegramMarkdown({
        ...params,
        pool_id: params.pool_id,
        token_account_ids: params.token_account_ids,
        token_symbols: params.token_symbols,
        token_price: formatBalance(params.token_price),
        liq: formatBalance(params.liq),
      })
    );
  } catch (error) {}
};

export const alertTokenHandle = async (params: ICreateToken) => {
  try {
    telegramAlertToken(params);
  } catch (error) {
    if (params.token_contract === contract) {
      await telegramAlertToken(params);
    }
  }
};

export async function getSignerAccountId(
  transactionHash: string
): Promise<string | null> {
  const url = `https://nearblocks.io/_next/data/nearblocks/en/txns/${transactionHash}.json?hash=${transactionHash}`;

  const headers = {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
  };

  try {
    const response = await axios.get(url, { headers });
    if (response.status === 200) {
      return response.data.pageProps.data.txns[0].signer_account_id;
    }
  } catch (error) {
    console.error("Error fetching signer account ID:", error?.message);
  }

  return null;
}

export async function getTransactionHash(
  contract: string
): Promise<string | null> {
  const url = `https://nearblocks.io/_next/data/nearblocks/en/address/${contract}.json/`;

  const headers = {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "no-cache",
    pragma: "no-cache",
  };

  try {
    const response = await axios.get(url, { headers });
    const transactionHash =
      response.data.pageProps.contractData.deployments[0].transaction_hash;
    return transactionHash;
  } catch (error) {
    console.error("Error fetching transaction hash:", error?.message);
    return null;
  }
}

export async function getSignerFromContract(
  contract: string
): Promise<string | null> {
  const transactionHash = await getTransactionHash(contract);
  if (transactionHash) {
    return await getSignerAccountId(transactionHash);
  }
  return null;
}

// example
