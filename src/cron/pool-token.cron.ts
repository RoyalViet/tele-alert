import axios from "axios";
import { CronJob } from "cron";
import fs from "fs";
import path from "path";
import { ICreateToken } from "src/interfaces/token.interface";
import { bigNumber, formatBalance } from "../common/helper/bigNumber";
import { generateTelegramHTML } from "../common/helper/common.helper";
import { handlePushTelegramNotificationController } from "../controllers/common/homepageController";
import { alertTokenHandle } from "../controllers/token/token.handle";

// Đường dẫn tới file chứa các meme
const tokenFilePath = path.join(
  process.cwd(),
  "src",
  "seeds",
  "token.seed.json"
);

// Đường dẫn tới file chứa các meme
const priceTokenPath = path.join(
  process.cwd(),
  "src",
  "seeds",
  "price-token.seed.json"
);

// Hàm để đọc danh sách token từ file
const readTokenList = (): Array<any> => {
  if (fs.existsSync(tokenFilePath)) {
    const data = fs.readFileSync(tokenFilePath, "utf-8");
    return JSON.parse(data);
  }
  return [];
};

// Hàm để ghi danh sách token vào file
const writeTokenList = (tokenList: Array<any>) => {
  fs.writeFileSync(tokenFilePath, JSON.stringify(tokenList, null, 2), "utf-8");
};

//
const readPriceTokenList = (): Record<string, any> => {
  if (fs.existsSync(priceTokenPath)) {
    const data = fs.readFileSync(priceTokenPath, "utf-8");
    return JSON.parse(data);
  }
  return {};
};

// Hàm để ghi danh sách token vào file
const writePriceTokenList = (tokenList: Record<string, any>) => {
  fs.writeFileSync(priceTokenPath, JSON.stringify(tokenList, null, 2), "utf-8");
};

let count = 1;
const MAX_COUNT = 2;
export const contract = "game.hot.tg";
const wNearContract = "wrap.near";

interface TokenPrice {
  price: string; // Giá của token, dưới dạng chuỗi
  symbol: string; // Ký hiệu của token
  decimal: number; // Số thập phân của token
}

interface PriceResponse {
  [key: string]: TokenPrice; // Dùng index signature để cho phép các key tùy ý
}

const fetchTokenPrices = async (): Promise<PriceResponse> => {
  const response = await axios.get(`https://api.ref.finance/list-token-price`);
  return response.data;
};

const processTokenPrice = (
  listPrice: PriceResponse,
  contract: string
): string[] => {
  const notifications: string[] = [];
  if (listPrice[contract]) {
    if (bigNumber(listPrice[contract]?.price).gt(0) && count < 100) {
      count++;
      notifications.push(generateTelegramHTML(listPrice[contract]));
    }
  }
  return notifications;
};

const updatePriceTokenList = (
  listPrice: PriceResponse,
  listPriceSeed: any
): any => {
  const updates: any[] = [];
  Object.keys(listPrice).forEach((key) => {
    if (!listPriceSeed[key]) {
      updates.push({
        ...listPrice[key],
        contract: key,
      });
      listPriceSeed[key] = { ...listPrice[key], contract: key };
    }
  });
  return updates;
};

const listPriceSeed = readPriceTokenList();
const fetchAndProcessTokenPrices = async (): Promise<void> => {
  console.log(`v2 running cron job crawl pool token ${contract}...`);
  try {
    const listPrice = await fetchTokenPrices();
    const notifications = processTokenPrice(listPrice, contract);

    notifications.forEach((body) => {
      handlePushTelegramNotificationController({ body });
    });

    const updates = updatePriceTokenList(listPrice, listPriceSeed);

    if (updates.length) {
      updates.forEach((update: any) => {
        handlePushTelegramNotificationController({
          body: generateTelegramHTML(update),
        });
      });
      writePriceTokenList(listPriceSeed);
    }
  } catch (error) {
    console.error("Error fetching token prices:", error.message);
  }
};

const filterValidPools = (data: any[]): any[] => {
  return data.filter(
    (i) =>
      bigNumber(i?.tvl).gt(0) &&
      bigNumber(i?.token0_ref_price).gt(0) &&
      (i?.token_account_ids as string[]).includes(wNearContract)
  );
};

const createTokenInfo = (pool: any): ICreateToken => {
  return {
    pool_id: Number(pool?.id),
    token_contract: (pool?.token_account_ids as string[])?.find(
      (i) => i !== wNearContract
    ),
    token_account_ids: pool?.token_account_ids as string[],
    token_symbols: pool?.token_symbols as string[],
    token_price: bigNumber(pool?.token0_ref_price).toNumber(),
    liq: bigNumber(pool?.tvl).toNumber(),
    network: "Near",
    tvl: pool?.tvl,
  };
};

interface PoolItem {
  pool_kind: string; // Loại pool, ví dụ: "SIMPLE_POOL"
  token_account_ids: string[]; // Danh sách địa chỉ tài khoản token
  amounts: string[]; // Danh sách số lượng tương ứng với token
  total_fee: number; // Phí tổng
  shares_total_supply: string; // Tổng số cổ phần được phát hành
  amp: number; // Hệ số điều chỉnh (nếu có)
  farming: boolean; // Trạng thái farming
  token_symbols: string[]; // Danh sách ký hiệu của token
  update_time: number; // Thời gian cập nhật (timestamp)
  id: string; // ID của pool
  tvl: string; // Tổng giá trị bị khóa (TVL)
  token0_ref_price: string; // Giá tham chiếu của token0
}

const tokenSeed = readTokenList();
const fetchAndProcessPools = async (): Promise<any> => {
  try {
    const raw: { data: Array<PoolItem> } = await axios.get(
      `https://api.ref.finance/list-pools`
    );
    const listInfoToken = filterValidPools(raw.data)
      .map(createTokenInfo)
      .sort((a, b) => (bigNumber(a.tvl).gte(b.tvl) ? -1 : 1));

    listInfoToken.forEach((t) => {
      const token = tokenSeed.find((i) => i.pool_id === t.pool_id);
      if (!token) {
        tokenSeed.unshift(t);
        alertTokenHandle(t);
        writeTokenList(tokenSeed);
      }
    });

    const filterToken = raw.data.filter(
      (i) =>
        bigNumber(i?.tvl).gt(0) &&
        bigNumber(i?.token0_ref_price).gt(0) &&
        (i?.token_account_ids as string[]).includes(contract) &&
        ((i?.token_account_ids as string[]).includes("wrap.near") ||
          (i?.token_account_ids as string[]).includes("usdt.tether-token.near"))
    );

    const rsFocus = filterToken
      .sort((a, b) => (bigNumber(a.tvl).gte(b.tvl) ? -1 : 1))
      .map((i) => ({
        id: i?.id,
        token_account_ids: i?.token_account_ids,
        token_symbols: i?.token_symbols,
        token_price: i?.token0_ref_price,
        liq: formatBalance(i?.tvl),
      }));

    if (rsFocus.length && count < MAX_COUNT) {
      count++;
      handlePushTelegramNotificationController({
        body: rsFocus.map((i) => generateTelegramHTML(i)).join("\n\n"),
      });
    }
  } catch (error) {
    console.error("Error fetching pools:", error.message);
  }
};

const checkReleasePoolToken = new CronJob("*/10 * * * * *", () => {
  fetchAndProcessTokenPrices();
  fetchAndProcessPools();
});

export { checkReleasePoolToken };
