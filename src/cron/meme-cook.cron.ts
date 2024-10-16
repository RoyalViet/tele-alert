import axios from "axios";
import { CronJob } from "cron";
import fs from "fs";
import path from "path";
import { bigNumber, formatBalance } from "../common/helper/bigNumber";
import { handlePushTelegramNotificationController } from "../controllers/common/homepageController";
import { generateTelegramHTML } from "../common/helper/common.helper";

// Đường dẫn tới file chứa các meme
const idsPath = path.join(
  process.cwd(),
  "src",
  "seeds",
  "ids-meme-full-cap.seed.json"
);

// Hàm để đọc meme_id từ file vào Set
const readMemeIdsFromFile = () => {
  if (fs.existsSync(idsPath)) {
    const data = fs.readFileSync(idsPath, "utf-8"); // Đọc file
    const memeIdArray = JSON.parse(data); // Chuyển đổi JSON thành mảng
    return new Set(memeIdArray); // Trả về Set
  }
  return new Set(); // Trả về Set rỗng nếu file không tồn tại
};

// Hàm để ghi Set vào file
const writeMemeIdsToFile = () => {
  const memeIdArray = Array.from(sentMemeIds); // Chuyển đổi Set thành mảng
  fs.writeFileSync(idsPath, JSON.stringify(memeIdArray, null, 2), "utf-8"); // Ghi vào file
};

// Đọc meme_id từ file vào Set
const sentMemeIds = readMemeIdsFromFile();

interface Meme {
  meme_id: number;
  end_timestamp_ms: number;
  total_deposit: string;
  hard_cap: string;
  soft_cap: string;
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
  const totalSupply = bigNumber(meme.total_supply)
    .dividedBy(Math.pow(10, decimals))
    .toFixed(2);
  const totalDeposit = bigNumber(meme.total_deposit)
    .dividedBy(Math.pow(10, 24))
    .toFixed(2);
  const softCap = bigNumber(meme.soft_cap)
    .dividedBy(Math.pow(10, 24))
    .toFixed(2);
  const hardCap = bigNumber(meme.hard_cap || 0)
    .dividedBy(Math.pow(10, 24))
    .toFixed(2);

  const memeDetails = {
    OwnerLink: `https://nearblocks.io/address/${meme.owner}?tab=tokentxns`,
    TotalDeposit: `${formatBalance(totalDeposit)} Near`,
    HardCap: `${formatBalance(hardCap)} Near`,
    ID: meme.meme_id,
    Owner: meme.owner,
    Name: meme.name,
    Symbol: meme.symbol,
    SoftCap: `${formatBalance(softCap)} Near`,
    Decimals: meme.decimals,
    TotalSupply: `${formatBalance(totalSupply)}`,
    Contract: meme.token_id ? meme.token_id : "N/A",
    PoolID: meme.pool_id ? meme.pool_id : "N/A",
    LinkDex: meme.pool_id
      ? `https://dexscreener.com/near/refv1-${meme.pool_id}`
      : "N/A",
    Twitter: meme.twitterLink ? meme.twitterLink : "N/A",
    Telegram: meme.telegramLink ? meme.telegramLink : "N/A",
    Description: meme.description ? meme.description : "N/A",
    Image: `![View Image](https://plum-necessary-chameleon-942.mypinata.cloud/ipfs/${meme.image})`,
  };

  return generateTelegramHTML(memeDetails);
}

const existingMemes = readExistingMemes();

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
      (meme) => meme.end_timestamp_ms + 30 * 60 * 1000 > currentTime
    );

    response.data.forEach((m) => {
      const hasHardCap =
        bigNumber(m.total_deposit).gte(m.hard_cap) &&
        bigNumber(m.hard_cap).gte(m.soft_cap);

      if (hasHardCap && !sentMemeIds.has(m.meme_id)) {
        handlePushTelegramNotificationController({
          body: generateTelegramHTMLMemeCook(m),
        });
        // Thêm meme_id vào Set để tránh gửi lại
        sentMemeIds.add(m.meme_id);
        console.log([...sentMemeIds]);
        writeMemeIdsToFile();
      }
    });

    const newMemes = activeMemes.filter((activeMeme) => {
      const isNotInExistingMemes = !existingMemes.some(
        (existingMeme) => existingMeme.meme_id === activeMeme.meme_id
      );
      return isNotInExistingMemes;
    });

    if (newMemes.length) {
      handlePushTelegramNotificationController({
        body: newMemes
          .map((i: any) => generateTelegramHTMLMemeCook(i))
          .join("\n\n"),
      });

      // Thêm các meme mới vào mảng hiện có và ghi lại vào file
      existingMemes.unshift(...newMemes);
      // const updatedMemes = [...newMemes, ...existingMemes];
      writeExistingMemes(existingMemes);
    }

    return newMemes;
  } catch (error) {
    console.error("Error fetching memes:", error?.message);
    return [];
  }
}
const checkMemeCooking = new CronJob("*/10 * * * * *", async () => {
  console.log(`v2 running cron job crawl meme cook ...`);
  fetchActiveMemes();
  return;
});

export { checkMemeCooking };
