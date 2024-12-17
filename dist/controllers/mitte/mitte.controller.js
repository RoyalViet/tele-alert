"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crawlCoins = crawlCoins;
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const homepageController_1 = require("../common/homepageController");
const common_helper_1 = require("../../common/helper/common.helper");
const caFilePath = path_1.default.join(process.cwd(), "src", "controllers", "mitte", "ca.json");
const readCaList = () => {
    if (fs_1.default.existsSync(caFilePath)) {
        const data = fs_1.default.readFileSync(caFilePath, "utf-8");
        return JSON.parse(data);
    }
    return [];
};
const writeCaList = (cas) => {
    fs_1.default.writeFileSync(caFilePath, JSON.stringify(cas, null, 2), "utf-8");
};
let existingIds = readCaList();
async function crawlCoins() {
    const browser = await puppeteer_1.default.launch({ headless: true });
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
        existingIds = [...existingIds, ...uniqueNewIds];
        writeCaList(existingIds);
        (0, homepageController_1.handlePushTelegramNotificationController)({
            body: uniqueNewIds
                .map((i) => (0, common_helper_1.generateTelegramHTML)({
                contract: i,
                mitteLink: `https://beta.mitte.gg/meme?c=${i}`,
                XLink: `https://x.com/search?q=${i}&src=typed_query`,
            }))
                .join("\n\n"),
        });
    }
    catch (error) {
        console.error("Error crawling coins");
    }
    finally {
        await browser.close();
    }
}
//# sourceMappingURL=mitte.controller.js.map