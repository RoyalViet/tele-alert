// Interfaces
import BigNumber from "bignumber.js";
import { IBaseQueryParams } from "./common.interface";

export interface ICreateToken {
  network?: string;
  token_contract: string;
  tvl?: string;
  token_account_ids: string[];
  token_symbols: string[];
  token_price: number;
  liq: number;
  pool_id: number;
  TokenLink?: string;
  RefLink?: string;
  DexLink?: string;
  owner?: string;
  decimals?: string | number;
  name?: string;
}

export interface IUpdateToken {
  id: number;
  network?: string;
  token_contract: string;
  token_account_ids: string[];
  token_symbols: string[];
  token_price: BigNumber;
  liq: BigNumber;
  pool_id: number;
}

export interface ITokenQueryParams extends IBaseQueryParams {
  keyword?: string;
}
