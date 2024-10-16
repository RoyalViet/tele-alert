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
const MAX_COUNT = 100;
export const contract = "game.hot.tg";
const wNearContract = "wrap.near";

const checkReleasePoolToken = new CronJob("*/10 * * * * *", async () => {
  console.log(`v2 running cron job crawl pool token ${contract}...`);
  try {
    try {
      const listPrice = await axios.get(
        `https://api.ref.finance/list-token-price`,
        {}
      );

      if (listPrice.data[contract]) {
        if (bigNumber(listPrice.data[contract]?.price).gt(0) && count < 100) {
          count++;
          handlePushTelegramNotificationController({
            body: generateTelegramHTML(listPrice.data[contract]),
          });
        }
      }

      const listPriceSeed = readPriceTokenList();

      if (Object.keys(listPrice.data || {})) {
        Object.keys(listPrice.data || {}).forEach((key: string) => {
          if (!listPriceSeed[key]) {
            handlePushTelegramNotificationController({
              body: generateTelegramHTML({
                ...listPrice.data[key],
                contract: key,
              }),
            });
            listPriceSeed[key] = { ...listPrice.data[key], contract: key };
            writePriceTokenList(listPriceSeed);
          }
        });
      }
    } catch (error) {}

    const raw = await axios.get(`https://api.ref.finance/list-pools`, {});

    const listInfoToken: Array<ICreateToken> = raw?.data
      ?.filter(
        (i: any) =>
          bigNumber(i?.tvl).gt(0) &&
          bigNumber(i?.token0_ref_price).gt(0) &&
          (i?.token_account_ids as Array<string>).includes(wNearContract)
        // ||
        // (i?.token_account_ids as Array<string>).includes(
        //   "usdt.tether-token.near"
        // )
      )
      .sort((a: any, b: any) => (bigNumber(a.tvl).gte(b.tvl) ? -1 : 1))
      .map((i: any) => {
        return {
          pool_id: Number(i?.id),
          token_contract: (i?.token_account_ids as string[])?.find(
            (i) => i !== wNearContract
          ),
          token_account_ids: i?.token_account_ids as string[],
          token_symbols: i?.token_symbols as string[],
          token_price: bigNumber(i?.token0_ref_price).toNumber(),
          liq: bigNumber(i?.tvl).toNumber(),
          network: "Near",
        } as ICreateToken;
      });

    const tokenSeed = readTokenList();
    if (listInfoToken.length) {
      listInfoToken.forEach((t) => {
        const token = tokenSeed.find((i) => i.pool_id === t.pool_id);
        if (!token) {
          alertTokenHandle(t);
          writeTokenList([t, ...tokenSeed]);
        }
      });
    }

    const filterToken = raw?.data?.filter(
      (i: any) =>
        bigNumber(i?.tvl).gt(0) &&
        bigNumber(i?.token0_ref_price).gt(0) &&
        (i?.token_account_ids as Array<string>).includes(contract) &&
        ((i?.token_account_ids as Array<string>).includes("wrap.near") ||
          (i?.token_account_ids as Array<string>).includes(
            "usdt.tether-token.near"
          ))
    );

    const rsFocus: Array<any> = filterToken
      .sort((a: any, b: any) => (bigNumber(a.tvl).gte(b.tvl) ? -1 : 1))
      .map((i: any) => {
        return {
          // ...i,
          id: i?.id,
          token_account_ids: i?.token_account_ids,
          token_symbols: i?.token_symbols,
          token_price: i?.token0_ref_price,
          liq: formatBalance(i?.tvl),
        };
      });

    if (rsFocus.length && count < MAX_COUNT) {
      count++;
      handlePushTelegramNotificationController({
        body: rsFocus.map((i: any) => generateTelegramHTML(i)).join("\n\n"),
      });
    }
  } catch (error) {
    console.log(`error: `, error?.message);
    // handlePushTelegramNotificationController({
    //   body: generateTelegramHTML({ error }),
    // });
  }
  return;
});

interface Meme {
  meme_id: number;
  end_timestamp_ms: number;
  // Các thuộc tính khác nếu cần
}

// Đường dẫn tới file chứa các meme
const filePath = path.join(
  process.cwd(),
  "src",
  "seeds",
  "meme-cook.seed.json"
);

// Hàm để đọc các meme từ file
function readExistingMemes(): Meme[] {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data) as Meme[];
}

// Hàm để ghi các meme vào file
function writeExistingMemes(memes: Meme[]): void {
  fs.writeFileSync(filePath, JSON.stringify(memes, null, 2), "utf8");
}

function generateTelegramHTMLMemeCook(meme: any): string {
  const decimals = meme.decimals || 18; // Mặc định là 18 nếu không có
  const totalSupply = (
    parseFloat(meme.total_supply) / Math.pow(10, decimals)
  ).toFixed(2);
  const totalDeposit = (
    parseFloat(meme.total_deposit) / Math.pow(10, 24)
  ).toFixed(2);

  return `
*Total Deposit:* ${formatBalance(totalDeposit)} N
*ID:* ${meme.meme_id}
*Owner:* ${meme.owner}
*Name:* ${meme.name}
*Symbol:* ${meme.symbol}
*Decimals:* ${meme.decimals}
*Total Supply:* ${formatBalance(totalSupply)}
*Twitter:* ${meme.twitterLink ? meme.twitterLink : "N/A"}
*Telegram:* ${meme.telegramLink ? meme.telegramLink : "N/A"}
*Image:* [View Image](https://plum-necessary-chameleon-942.mypinata.cloud/ipfs/${
    meme.image
  })
  `;
}

// Hàm để lấy các meme chưa hết thời gian countdown
async function fetchActiveMemes(): Promise<Meme[]> {
  try {
    const response = await axios.get<Meme[]>("https://api.meme.cooking/meme", {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/json",
        origin: "https://meme.cooking",
        pragma: "no-cache",
        priority: "u=1, i",
        referer: "https://meme.cooking/",
        "sec-ch-ua":
          '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
      },
    });

    // Lọc các meme còn thời gian
    const currentTime = Date.now();
    const activeMemes = response.data.filter(
      (meme) => meme.end_timestamp_ms > currentTime
    );

    const existingMemes = readExistingMemes();

    // So sánh với mảng có sẵn để tìm các meme_id mới
    const newMemes = activeMemes.filter(
      (activeMeme) =>
        !existingMemes.some(
          (existingMeme) => existingMeme.meme_id === activeMeme.meme_id
        )
    );

    // Log ra các meme_id mới
    console.log("New meme IDs:", newMemes);
    if (newMemes.length) {
      handlePushTelegramNotificationController({
        body: newMemes
          .map((i: any) => generateTelegramHTMLMemeCook(i))
          .join("\n\n"),
      });

      // Thêm các meme mới vào mảng hiện có và ghi lại vào file
      const updatedMemes = [...newMemes, ...existingMemes];
      writeExistingMemes(updatedMemes);
    }

    return newMemes;
  } catch (error) {
    console.error("Error fetching memes:", error?.message);
    return [];
  }
}

export { checkReleasePoolToken };
