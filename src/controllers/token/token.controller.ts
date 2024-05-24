import httpStatusCodes from "http-status-codes";

// Interfaces
import IController from "../../interfaces/IController";
import { ICreateToken } from "../../interfaces/token.interface";

// Services
import * as tokenService from "../../services/token/token.service";

// Utilities
import ApiResponse from "../../utilities/api-response.utility";

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
