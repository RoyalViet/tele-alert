import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import { handlePushTelegramNotificationController } from "../common/homepageController";
import { generateTelegramHTML } from "../../common/helper/common.helper";

const caFilePath = path.join(
  process.cwd(),
  "src",
  "controllers",
  "mitte",
  "ca.json"
);

const readCaList = (): string[] => {
  if (fs.existsSync(caFilePath)) {
    const data = fs.readFileSync(caFilePath, "utf-8");
    return JSON.parse(data);
  }
  return [];
};

const writeCaList = (cas: string[]) => {
  fs.writeFileSync(caFilePath, JSON.stringify(cas, null, 2), "utf-8");
};

const existingIds = readCaList();
export async function crawlCoins() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto("https://beta.mitte.gg/meme", {
      waitUntil: "networkidle2",
    });

    await page.waitForSelector('div[id^="coin-"]');

    const newIds = await page.evaluate(() => {
      const coinElements = document.querySelectorAll('div[id^="coin-"]');
      return Array.from(coinElements).map((coin) => {
        const id = coin.id;
        return id;
      });
    });
    const newIdsSet = new Set(newIds);
    const existingIdsSet = new Set(existingIds);
    const uniqueNewIds = [...newIdsSet].filter((id) => !existingIdsSet.has(id));
    writeCaList([...existingIds, ...uniqueNewIds]);
    handlePushTelegramNotificationController({
      body: uniqueNewIds
        .map((i: any) =>
          generateTelegramHTML({
            contract: i,
            mitteLink: `https://beta.mitte.gg/meme?c=${i}`,
            XLink: `https://x.com/search?q=${i}&src=typed_query`,
          })
        )
        .join("\n\n"),
    });
  } catch (error) {
    console.error("Error crawling coins");
  } finally {
    await browser.close();
  }
}
