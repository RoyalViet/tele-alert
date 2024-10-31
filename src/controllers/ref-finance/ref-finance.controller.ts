import {
  fetchAllPools,
  ftGetTokenMetadata,
  ftGetTokensMetadata,
} from "./ref-sdk/src";
import { Expose } from "class-transformer";
import { plainToClass } from "../../common/helper/classTransformer.helper";
import fs from "fs";
import path from "path";
import { handlePushTelegramNotificationController } from "../common/homepageController";
import { generateTelegramHTML } from "../../common/helper/common.helper";
import { getSignerFromContract } from "../token/token.handle";
import { fetchAndProcessPools } from "../../cron/pool-token.cron";

// Định nghĩa kiểu Pool cho Rated Pools
interface RatedPool {
  id: number;
  fee: number;
  pool_kind: "RATED_SWAP";
  shareSupply: string;
  supplies: Record<string, string>; // Tài sản và số lượng
  tokenIds: string[];
}

// Định nghĩa kiểu Pool cho Unrated Pools
interface UnratedPool {
  id: number;
  fee: number;
  pool_kind: "UNRATED_SWAP";
  shareSupply: string;
  supplies: Record<string, string>;
  tokenIds: string[];
}

// Định nghĩa kiểu Pool cho Simple Pools
interface SimplePool {
  id: number;
  fee: number;
  pool_kind: "SIMPLE_POOL";
  shareSupply: string;
  supplies: Record<string, string>;
  tokenIds: string[];
}

class Pool {
  @Expose({ name: "id" })
  pool_id: number;

  @Expose({ name: "tokenIds" })
  token_account_ids: string[];

  @Expose({ name: "pool_kind" })
  poolKind: string;

  @Expose({ name: "decimals" })
  decimals?: number | string;

  @Expose({ name: "icon" })
  image?: string;

  @Expose({ name: "symbol" })
  symbol?: string;

  @Expose({ name: "name" })
  name?: string;

  OwnerLink?: string;
  OwnerPikeLink?: string;
  TokenLink?: string;
  RefLink?: string;
  owner?: string;
  _?: string;
  __?: string;
  ___?: string;

  get token_contract() {
    return this.token_account_ids.find((i) => i !== "wrap.near");
  }
}

// Định nghĩa kiểu tổng hợp cho tất cả các loại pool
interface AllPools {
  ratedPools: RatedPool[];
  unRatedPools: UnratedPool[];
  simplePools: SimplePool[];
}

// Đường dẫn tới file chứa các meme
const poolsFilePath = path.join(
  process.cwd(),
  "src",
  "seeds",
  "pools.seed.json"
);

// Hàm để đọc danh sách token từ file
const readPoolList = (): Array<Pool> => {
  if (fs.existsSync(poolsFilePath)) {
    const data = fs.readFileSync(poolsFilePath, "utf-8");
    return JSON.parse(data);
  }
  return [];
};

// Hàm để ghi danh sách token vào file
const writePoolList = (poolList: Array<any>) => {
  fs.writeFileSync(poolsFilePath, JSON.stringify(poolList, null, 2), "utf-8");
};

function generateMsgHTML(pool: Pool): string {
  const poolDetails = {
    OwnerLink:
      pool?.owner && pool?.owner !== "null"
        ? `[${pool?.owner}](https://nearblocks.io/address/${pool?.owner}?tab=tokentxns)`
        : "N/A",
    OwnerPikeLink:
      pool?.owner && pool?.owner !== "null"
        ? `https://pikespeak.ai/wallet-explorer/${pool.owner}/transfers`
        : "N/A",
    AddressTokenLink: `https://nearblocks.io/address/${pool.token_contract}`,
    _: "==============================",
    Contract: pool.token_contract,
    PoolID: pool.pool_id || "N/A",
    TokenLink: `https://nearblocks.io/token/${pool.token_contract}`,
    RefLink: `https://app.ref.finance/#usdt.tether-token.near|${pool.token_contract}`,
    DexLink: pool.pool_id
      ? `https://dexscreener.com/near/refv1-${pool.pool_id}`
      : "N/A",
    __: "==============================",
    Owner: pool.owner,
    Name: pool.name,
    Symbol: pool.symbol,
    Decimals: pool.decimals,
  };

  return generateTelegramHTML(poolDetails);
}

// Sử dụng hàm để lấy pool
const poolsSeed = readPoolList();

export async function getAllPools() {
  console.log(`v2 running cron job crawl getAllPools...`);
  try {
    const pools: AllPools = await fetchAllPools();

    const allPools = plainToClass(
      Pool,
      [
        ...(pools.simplePools || []),
        ...(pools.unRatedPools || []),
        ...(pools.ratedPools || []),
        // ...(pools.simplePools.slice(-55) || []),
      ].filter((i) => i.tokenIds.includes("wrap.near"))
    );

    const newPoolsPromises = allPools.map(async (i) => {
      const isNew = !poolsSeed.find((j) => j.pool_id === i.pool_id);
      if (isNew) {
        try {
          const [info, owner] = await Promise.all([
            getTokenDetail(i.token_contract),
            getSignerFromContract(i.token_contract),
          ]);
          return {
            owner,
            ...i,
            token_contract: i.token_contract,
            name: info.name,
            symbol: info.symbol,
            decimals: info.decimals,
          };
        } catch (error) {
          return {
            owner: "N/A",
            ...i,
            token_contract: i.token_contract,
            name: "N/A",
            symbol: "N/A",
            decimals: "N/A",
          };
        }
      }
      return null;
    });

    const newPools = (await Promise.all(newPoolsPromises)).filter(Boolean);

    if (newPools.length) {
      handlePushTelegramNotificationController({
        body: newPools.map((i) => generateMsgHTML(i)).join("\n\n"),
      });
      poolsSeed.unshift(...newPools);
      writePoolList(poolsSeed);
    }

    // return allPools;
  } catch (error) {
    fetchAndProcessPools();
    console.error("Error fetching pools:", error?.message || error);
    // return [];
  }
}

// Hàm lấy chi tiết metadata của một token
export async function getTokenDetail(tokenId: string) {
  try {
    const tokenMetadata = await ftGetTokenMetadata(tokenId);
    return tokenMetadata;
  } catch (error) {
    console.error(`Error fetching token metadata for ${tokenId}:`, error);
  }
}

// Hàm lấy chi tiết metadata của nhiều token
export async function getTokensDetail(tokenIds: string[]): Promise<void> {
  try {
    const tokensMetadata = await ftGetTokensMetadata(tokenIds, {});
    console.log("Tokens Metadata:", tokensMetadata);
  } catch (error) {
    console.error("Error fetching tokens metadata:", error);
  }
}
