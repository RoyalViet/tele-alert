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

interface RatedPool {
  id: number;
  fee: number;
  pool_kind: "RATED_SWAP";
  shareSupply: string;
  supplies: Record<string, string>; // Tài sản và số lượng
  tokenIds: string[];
}

interface UnratedPool {
  id: number;
  fee: number;
  pool_kind: "UNRATED_SWAP";
  shareSupply: string;
  supplies: Record<string, string>;
  tokenIds: string[];
}

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

interface AllPools {
  ratedPools: RatedPool[];
  unRatedPools: UnratedPool[];
  simplePools: SimplePool[];
}

const poolsFilePath = path.join(
  process.cwd(),
  "src",
  "seeds",
  "pools.seed.json"
);

const readPoolList = (): Array<Pool> => {
  if (fs.existsSync(poolsFilePath)) {
    const data = fs.readFileSync(poolsFilePath, "utf-8");
    return JSON.parse(data);
  }
  return [];
};

const writePoolList = (poolList: Array<any>) => {
  fs.writeFileSync(poolsFilePath, JSON.stringify(poolList, null, 2), "utf-8");
};

const poolsReleaseFilePath = path.join(
  process.cwd(),
  "src",
  "seeds",
  "token.seed.json"
);

const readPoolReleaseList = (): Array<any> => {
  if (fs.existsSync(poolsReleaseFilePath)) {
    const data = fs.readFileSync(poolsReleaseFilePath, "utf-8");
    return JSON.parse(data);
  }
  return [];
};

const writeReleaseList = (tokenList: Array<any>) => {
  fs.writeFileSync(
    poolsReleaseFilePath,
    JSON.stringify(tokenList, null, 2),
    "utf-8"
  );
};

function generateMsgHTML(pool: Pool): string {
  const poolDetails = {
    "⭐ OwnerLink":
      pool?.owner && pool?.owner !== "null"
        ? `[${pool?.owner}](https://nearblocks.io/address/${pool?.owner}?tab=tokentxns)`
        : "N/A",
    OwnerPikeLink:
      pool?.owner && pool?.owner !== "null"
        ? `https://pikespeak.ai/wallet-explorer/${pool.owner}/transfers`
        : "N/A",
    "⭐ AddressTokenLink": `https://nearblocks.io/address/${pool.token_contract}?tab=tokentxns`,
    _: "==============================",
    "⭐ Contract": pool.token_contract,
    "⭐ PoolID": pool.pool_id || "N/A",
    "⭐ Decimals": pool.decimals,
    "⭐ PoolLink": pool.pool_id
      ? `https://app.ref.finance/pool/${pool.pool_id}`
      : "N/A",
    TokenLink: `https://nearblocks.io/token/${pool.token_contract}`,
    "⭐ RefLink": `https://app.ref.finance/#usdt.tether-token.near|${pool.token_contract}`,
    DexLink: pool.pool_id
      ? `https://dexscreener.com/near/refv1-${pool.pool_id}`
      : "N/A",
    __: "==============================",
    Owner: pool.owner,
    Name: pool.name,
    Symbol: pool.symbol,
    Tag: "From All Pools",
  };

  return generateTelegramHTML(poolDetails);
}

const poolsSeed = readPoolList();
const poolsReleaseSeed = readPoolReleaseList();

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

      poolsReleaseSeed.unshift(...newPools);
      writeReleaseList(poolsReleaseSeed);
    }

    // return allPools;
  } catch (error) {
    fetchAndProcessPools();
    console.error(
      "Error fetching pools:",
      String(error?.message).length > 1000
        ? String(error?.message).substring(0, 1000) + "..."
        : String(error?.message)
    );
    // return [];
  }
}

export async function getTokenDetail(tokenId: string) {
  try {
    const tokenMetadata = await ftGetTokenMetadata(tokenId);
    return tokenMetadata;
  } catch (error) {
    console.error(`Error fetching token metadata for ${tokenId}:`, error);
  }
}

export async function getTokensDetail(tokenIds: string[]): Promise<void> {
  try {
    const tokensMetadata = await ftGetTokensMetadata(tokenIds, {});
    console.log("Tokens Metadata:", tokensMetadata);
  } catch (error) {
    console.error("Error fetching tokens metadata:", error);
  }
}
