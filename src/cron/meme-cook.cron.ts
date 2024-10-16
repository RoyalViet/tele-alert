import axios from "axios";
import { CronJob } from "cron";
import fs from "fs";
import path from "path";
import { formatBalance } from "../common/helper/bigNumber";
import { handlePushTelegramNotificationController } from "../controllers/common/homepageController";

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
const checkMemeCooking = new CronJob("*/10 * * * * *", async () => {
  console.log(`v2 running cron job crawl meme cook ...`);
  fetchActiveMemes();
  return;
});

export { checkMemeCooking };
