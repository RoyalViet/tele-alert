// Interfaces
import { ICreateToken } from "../../interfaces/token.interface";

// Services
import * as tokenService from "../../services/token/token.service";
import * as telegramService from "../../services/telegram/telegramService";
import { formatBalance } from "../../common/helper/bigNumber";
import { StringError } from "../../errors/string.error";

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
      {
        ...params,
        pool_id: params.pool_id,
        token_account_ids: params.token_account_ids,
        token_symbols: params.token_symbols,
        token_price: formatBalance(params.token_price),
        liq: formatBalance(params.liq),
      },
      {
        isGenerateTelegramHTML: true,
      }
    );
  } catch (error) {}
};

export const alertTokenHandle = async (params: ICreateToken) => {
  try {
    const token = await tokenService.getDetailToken(params);
    if (!token) {
      telegramAlertToken(params);
      await tokenService.createToken(params);
    }
  } catch (error) {
    if (params.token_contract === "dd.tg") {
      await telegramAlertToken(params);
    }
  }
};
