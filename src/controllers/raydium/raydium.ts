import axios from "axios";
import fs from "fs";
import path from "path";
import { formatBalance } from "../../common/helper/bigNumber";
import { generateTelegramHTML } from "../../common/helper/common.helper";
import { handlePushTelegramNotificationController } from "../common/homepageController";
import { isToday } from "date-fns";

const poolsFilePath = path.join(
  process.cwd(),
  "src",
  "seeds",
  "raydium-pools.seed.json"
);

interface MintInfo {
  chainId: number;
  address: string;
  programId: string;
  logoURI: string;
  symbol: string;
  name: string;
  decimals: number;
  tags: string[];
  extensions: Record<string, unknown>; // hoặc có thể cụ thể hơn tùy theo cấu trúc của extensions
}

interface Config {
  id: string;
  index: number;
  protocolFeeRate: number;
  tradeFeeRate: number;
  fundFeeRate: number;
  createPoolFee: string; // có thể thay đổi thành number nếu cần
}

interface DailyStats {
  volume: number;
  volumeQuote: number;
  volumeFee: number;
  apr: number;
  feeApr: number;
  priceMin: number;
  priceMax: number;
  rewardApr: number[];
}

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

const maxRetries = 3;
const baseUrl = "https://api-v3.raydium.io/pools/info/list";

// max_page 490
export async function getAllPools({
  total_page = 10,
  per_page = 1000,
  timeDelay = 10000,
}) {
  try {
    let allPools: Array<Partial<Pool>> = [];

    for (let page = 1; page <= total_page; page++) {
      let retries = 0;

      while (retries < maxRetries) {
        try {
          const response = await axios.get(baseUrl, {
            params: {
              poolType: "all",
              poolSortField: "default",
              sortType: "desc",
              pageSize: per_page,
              page,
            },
            headers: {
              accept: "application/json, text/plain, */*",
              "accept-language": "en-US,en;q=0.5",
              origin: "https://raydium.io",
              priority: "u=1, i",
              referer: "https://raydium.io/",
              "sec-ch-ua":
                '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"macOS"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-site",
              "sec-gpc": "1",
              "user-agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
            },
          });

          const poolData: Array<Pool> = response?.data?.data?.data || [];
          allPools.push(
            ...poolData.map((p) => {
              return {
                type: p.type,
                id: p.id,
                programId: p.programId,
                mintA: p.mintA,
                mintB: p.mintB,
                tvl: p.tvl,
                marketId: p.marketId,
              };
            })
          );

          console.log(`Fetched page ${page}`);
          break; // Thoát khỏi vòng lặp nếu thành công
        } catch (error) {
          retries++;
          console.error(`Error fetching `);
          if (retries >= maxRetries) {
            console.error(
              `Failed to fetch page ${page} after ${maxRetries} attempts.`
            );
          }
        }
      }
    }
    console.log("allPools :", allPools);

    writePoolList(
      allPools.filter(
        (p) =>
          p &&
          [p?.mintA?.address, p?.mintB?.address].includes(
            "So11111111111111111111111111111111111111112"
          )
      )
    );
  } catch (error) {
    console.log("error :", error);
  }
}

function generateMsgHTML(pool: Pool): string {
  const infoToken =
    pool.mintA.address !== "So11111111111111111111111111111111111111112"
      ? pool.mintA
      : pool.mintB;
  const tokenAddress = infoToken.address;
  const poolDetails = {
    "⭐ TokenAddressLink": `https://solscan.io/token/${tokenAddress}`,
    "⭐ PoolLink": pool.id
      ? `https://raydium.io/liquidity/increase/?mode=add&pool_id=${pool.id}`
      : "N/A",
    "⭐ RaydiumLink": `https://raydium.io/swap/?inputMint=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB&outputMint=${infoToken.address}`,
    DexLink: pool.id ? `https://dexscreener.com/solana/${pool.id}` : "N/A",
    __: "==============================",
    TVL: `${formatBalance(pool.tvl)} $`,
    Name: infoToken.name,
    Symbol: infoToken.symbol,
  };

  return generateTelegramHTML(poolDetails);
}

interface CoinMarketCapInfo {
  id: number;
  name: string;
  symbol: string;
  description: string;
  logo: string;
  tags: { slug: string; name: string; group: string }[];
  urls: {
    website: string[];
    twitter: string[];
    chat: string[];
    explorer: string[];
  };
}

interface TokenInfo {
  id: string;
  chain: {
    id: string;
  };
  address: string;
  name: string;
  symbol: string;
  description: string;
  websites: {
    label: string;
    url: string;
  }[];
  socials: {
    type: string;
    url: string;
  }[];
  lockedAddresses: any[];
  createdAt: string;
  updatedAt: string;
  sortByDate: string;
  image: string;
  headerImage: string;
  profile: {
    header: boolean;
    website: boolean;
    twitter: boolean;
    discord: boolean;
    linkCount: number;
    imgKey: string;
  };
}

interface Data {
  cmc?: CoinMarketCapInfo;
  ti?: TokenInfo;
}

async function fetchTokenInfo(pairId: string) {
  const url = `https://io.dexscreener.com/dex/pair-details/v3/solana/${pairId}`;

  try {
    const response: { data?: Data } = await axios.get(url, {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.7",
        origin: "https://dexscreener.com",
        priority: "u=1, i",
        referer: "https://dexscreener.com/",
        "sec-ch-ua":
          '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "sec-gpc": "1",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      },
    });

    return response?.data?.ti;
  } catch (error) {
    console.error("Error fetching token info:", error);
  }
}

interface Pool {
  type: string;
  programId: string;
  id: string;
  marketId?: string;
  mintA: MintInfo;
  mintB: MintInfo;
  config: Config;
  price: number;
  mintAmountA: number;
  mintAmountB: number;
  feeRate: number;
  openTime: string; // có thể thay đổi thành number nếu cần
  tvl: number;
  day: DailyStats;
  week: DailyStats;
  month: DailyStats;
  pooltype: any[]; // hoặc có thể xác định kiểu cụ thể hơn nếu biết
  rewardDefaultInfos: any[]; // hoặc có thể xác định kiểu cụ thể hơn nếu biết
  farmUpcomingCount: number;
  farmOngoingCount: number;
  farmFinishedCount: number;
  lpMint: MintInfo;
  lpPrice: number;
  lpAmount: number;
  burnPercent: number;
  tokenInfo?: TokenInfo;
}

const poolsSeed = readPoolList();

export async function getPools({
  page = 1,
  per_page = 1000,
  timeDelay = 10000,
}) {
  console.log(`v2 running cron job crawl getAllPools...`);
  try {
    const listNewPools = await axios.get(baseUrl, {
      params: {
        poolType: "all",
        poolSortField: "default",
        sortType: "desc",
        pageSize: per_page,
        page,
      },
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.5",
        origin: "https://raydium.io",
        priority: "u=1, i",
        referer: "https://raydium.io/",
        "sec-ch-ua":
          '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "sec-gpc": "1",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
      },
    });

    const poolData: Array<Pool> =
      listNewPools?.data?.data?.data?.map((p: Pool) => {
        return {
          type: p.type,
          id: p.id,
          programId: p.programId,
          mintA: p.mintA,
          mintB: p.mintB,
          tvl: p.tvl,
          marketId: p.marketId,
        };
      }) || [];

    const newPoolsPromises = poolData.map(async (pool) => {
      const isNew =
        [pool.mintA?.address, pool.mintB?.address].includes(
          "So11111111111111111111111111111111111111112"
        ) &&
        !poolsSeed.find((j) => j.id.toLowerCase() === pool.id.toLowerCase());

      if (isNew) {
        try {
          const [info] = await Promise.all([fetchTokenInfo(pool.id)]);
          if (
            info?.image &&
            info?.headerImage &&
            info?.description &&
            info?.websites?.values &&
            info?.socials?.find((i) => i?.type?.toLowerCase() === "twitter")
              ?.url &&
            isToday(info?.createdAt)
          ) {
            return {
              ...pool,
            };
          }
          return null;
        } catch (error) {
          return null;
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
  } catch (error) {
    console.error(`Error fetching raydium :`, error);
  }
}
