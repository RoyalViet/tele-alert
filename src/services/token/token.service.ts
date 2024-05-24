import { getRepository } from "typeorm";
import { Token } from "../../entities/token/token.entity";
import { ICreateToken } from "../../interfaces/token.interface";
import ApiUtility from "../../utilities/api.utility";
import { StringError } from "../../errors/string.error";

const where = {};

const createToken = async (params: ICreateToken) => {
  const item = new Token();
  item.token_contract = params.token_contract;
  item.token_account_ids = params.token_account_ids.join(",");
  item.token_symbols = params.token_symbols.join(",");
  item.token_price = params.token_price;
  item.liq = params.liq;
  item.pool_id = params.pool_id;
  item.network = params.network;
  const tokenData = await getRepository(Token).save(item);
  return ApiUtility.sanitizeData(tokenData);
};

export const getDetailToken = async (
  params: Partial<ICreateToken & { id: string | number }>
) => {
  const query = {
    where: {
      ...where,
      ...(params?.pool_id && { pool_id: params.pool_id }),
      ...(params?.id && { id: params.id }),
    },
  };
  const tokenInfo = await getRepository(Token).findOne(query);
  if (!tokenInfo) {
    throw new StringError("Token is not existed");
  }
  return ApiUtility.sanitizeData(tokenInfo);
};

export { createToken };
