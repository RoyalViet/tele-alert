"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMemeCooking = exports.fetchMemeTrades = void 0;
const axios_1 = __importDefault(require("axios"));
const cron_1 = require("cron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bigNumber_1 = require("../common/helper/bigNumber");
const homepageController_1 = require("../controllers/common/homepageController");
const common_helper_1 = require("../common/helper/common.helper");
const pool_token_cron_1 = require("./pool-token.cron");
// Hàm fetchMemeTrades
const fetchMemeTrades = (memeId) => __awaiter(void 0, void 0, void 0, function* () {
    const url = `https://api.meme.cooking/trades?meme_id=${memeId}`;
    try {
        const response = yield axios_1.default.get(url, {
            headers: {
                accept: "*/*",
                "accept-language": "en-US,en;q=0.9",
                "cache-control": "no-cache",
                "content-type": "application/json",
                origin: "https://meme.cooking",
                pragma: "no-cache",
                priority: "u=1, i",
                referer: "https://meme.cooking/",
                "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"macOS"',
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
            },
        });
        // Tạo một đối tượng để lưu trữ tổng hợp theo account_id
        const accountMap = {};
        // Tổng hợp dữ liệu
        response.data.forEach((trade) => {
            const amountValue = (0, bigNumber_1.bigNumber)(trade.amount).dividedBy(Math.pow(10, 24));
            if (trade.is_deposit) {
                accountMap[trade.account_id] = (0, bigNumber_1.bigNumber)(accountMap[trade.account_id] || 0).plus(amountValue);
            }
            else {
                accountMap[trade.account_id] = (0, bigNumber_1.bigNumber)(accountMap[trade.account_id] || 0).minus(amountValue);
            }
        });
        // Chuyển đổi accountMap thành mảng kết quả
        const result = Object.entries(accountMap).map(([account_id, amount]) => ({
            account_id,
            amount,
        }));
        // Tính tổng amount
        const totalAmount = result.reduce((sum, item) => sum.plus(item.amount), new bigNumber_1.BigNumber(0));
        if (totalAmount.isZero()) {
            return;
        }
        // Sắp xếp các trade theo amount từ lớn đến bé
        const sortedResult = result
            .sort((a, b) => a.amount.minus(b.amount).toNumber())
            .map((i) => {
            const percent = i.amount.dividedBy(totalAmount).multipliedBy(100);
            return Object.assign(Object.assign({}, i), { amount: (0, bigNumber_1.formatBalance)(i.amount) + " Near", percent: percent.toFixed(2) + " %" });
        });
        // handlePushTelegramNotificationController({
        //   body: sortedResult
        //     .slice(0, 4)
        //     .map((i) => generateTelegramMarkdown(i))
        //     .join("\n\n"),
        // });
        console.log(sortedResult);
        return sortedResult;
    }
    catch (error) {
        console.error("Error fetching meme trades:", error === null || error === void 0 ? void 0 : error.message);
    }
});
exports.fetchMemeTrades = fetchMemeTrades;
// Đường dẫn tới file chứa các meme
const idsPath = path_1.default.join(process.cwd(), "src", "seeds", "ids-meme-full-cap.seed.json");
// Hàm để đọc meme_id từ file vào Set
const readMemeIdsFromFile = () => {
    if (fs_1.default.existsSync(idsPath)) {
        const data = fs_1.default.readFileSync(idsPath, "utf-8"); // Đọc file
        const memeIdArray = JSON.parse(data); // Chuyển đổi JSON thành mảng
        return new Set(memeIdArray); // Trả về Set
    }
    return new Set(); // Trả về Set rỗng nếu file không tồn tại
};
// Hàm để ghi Set vào file
const writeMemeIdsToFile = () => {
    const memeIdArray = Array.from(sentMemeIds); // Chuyển đổi Set thành mảng
    fs_1.default.writeFileSync(idsPath, JSON.stringify(memeIdArray, null, 2), "utf-8"); // Ghi vào file
};
// Đọc meme_id từ file vào Set
const sentMemeIds = readMemeIdsFromFile();
// Đường dẫn tới file chứa các meme
const filePath = path_1.default.join(process.cwd(), "src", "seeds", "meme-cook.seed.json");
// Hàm để đọc các meme từ file
function readExistingMemes() {
    if (!fs_1.default.existsSync(filePath)) {
        return [];
    }
    const data = fs_1.default.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}
// Hàm để ghi các meme vào file
function writeExistingMemes(memes) {
    fs_1.default.writeFileSync(filePath, JSON.stringify(memes, null, 2), "utf8");
}
function generateTelegramHTMLMemeCook(meme) {
    var _a, _b;
    const decimals = meme.decimals || 18; // Mặc định là 18 nếu không có
    const totalSupply = (0, bigNumber_1.bigNumber)(meme.total_supply)
        .dividedBy(Math.pow(10, decimals))
        .toFixed(2);
    const totalDeposit = (0, bigNumber_1.bigNumber)(meme.total_deposit)
        .dividedBy(Math.pow(10, 24))
        .toFixed(2);
    const softCap = (0, bigNumber_1.bigNumber)(meme.soft_cap)
        .dividedBy(Math.pow(10, 24))
        .toFixed(2);
    const hardCap = (0, bigNumber_1.bigNumber)(meme.hard_cap || 0)
        .dividedBy(Math.pow(10, 24))
        .toFixed(2);
    const memeContract = meme.token_id
        ? meme.token_id
        : `${meme.symbol}-${meme.meme_id}.meme-cooking.near`.toLowerCase();
    const memeDetails = {
        OwnerLink: `[${meme.owner}](https://nearblocks.io/address/${meme.owner}?tab=tokentxns)`,
        OwnerPikeLink: `[Owner Pike Link](https://pikespeak.ai/wallet-explorer/${meme.owner}/transfers)`,
        TotalDeposit: `${(0, bigNumber_1.formatBalance)(totalDeposit)} Near`,
        HardCap: `${(0, bigNumber_1.formatBalance)(hardCap)} Near`,
        _: "==============================",
        Contract: memeContract,
        PoolID: meme.pool_id ? meme.pool_id : "N/A",
        TokenLink: `[${memeContract}](https://nearblocks.io/token/${memeContract})`,
        RefLink: `[Ref Link ${memeContract}](https://app.ref.finance/#usdt.tether-token.near|${memeContract})`,
        DexLink: meme.pool_id
            ? `[Dex Link ${meme.pool_id}](https://dexscreener.com/near/refv1-${meme.pool_id})`
            : "N/A",
        __: "==============================",
        ID: meme.meme_id,
        Owner: meme.owner,
        Name: meme.name,
        Symbol: meme.symbol,
        SoftCap: `${(0, bigNumber_1.formatBalance)(softCap)} Near`,
        Decimals: meme.decimals,
        TotalSupply: `${(0, bigNumber_1.formatBalance)(totalSupply)}`,
        MemeLink: `[Meme Link ${meme.meme_id}](https://meme.cooking/meme/${meme.meme_id})`,
        ___: "==============================",
        Twitter: meme.twitterLink
            ? `[${(_a = meme.twitterLink.split("https://")) === null || _a === void 0 ? void 0 : _a[1]}](${meme.twitterLink})`
            : "N/A",
        Telegram: meme.telegramLink
            ? `[${(_b = meme.twitterLink.split("https://")) === null || _b === void 0 ? void 0 : _b[1]}](${meme.telegramLink})`
            : "N/A",
        Description: meme.description ? (0, common_helper_1.escapeMarkdown)(meme.description) : "N/A",
        Image: `(https://plum-necessary-chameleon-942.mypinata.cloud/ipfs/${meme.image})`,
    };
    return (0, common_helper_1.generateTelegramMarkdown)(memeDetails);
}
const existingMemes = readExistingMemes();
// Hàm để lấy các meme chưa hết thời gian countdown
function fetchActiveMemes() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get("https://api.meme.cooking/meme", {
                headers: {
                    accept: "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "cache-control": "no-cache",
                    "content-type": "application/json",
                    origin: "https://meme.cooking",
                    pragma: "no-cache",
                    priority: "u=1, i",
                    referer: "https://meme.cooking/",
                    "sec-ch-ua": '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": '"macOS"',
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    // "user-agent":
                    //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                },
            });
            // Lọc các meme còn thời gian
            const activeMemes = response.data;
            // const currentTime = Date.now();
            // const activeMemes = response.data.filter(
            //   (meme) => meme.end_timestamp_ms + 30 * 60 * 1000 > currentTime
            // );
            response.data.forEach((m) => {
                const hasHardCap = (0, bigNumber_1.bigNumber)(m.total_deposit).gte(m.hard_cap) &&
                    (0, bigNumber_1.bigNumber)(m.hard_cap).gte(m.soft_cap);
                if (hasHardCap && !sentMemeIds.has(m.meme_id)) {
                    (0, homepageController_1.handlePushTelegramNotificationController)({
                        body: generateTelegramHTMLMemeCook(m),
                    });
                    if (!m.pool_id) {
                        (0, pool_token_cron_1.fetchAndProcessPools)();
                    }
                    // fetchMemeTrades(m.meme_id)
                    // Thêm meme_id vào Set để tránh gửi lại
                    sentMemeIds.add(m.meme_id);
                    console.log([...sentMemeIds]);
                    writeMemeIdsToFile();
                }
            });
            const newMemes = activeMemes
                .filter((activeMeme) => {
                const isNotInExistingMemes = !existingMemes.some((existingMeme) => existingMeme.meme_id === activeMeme.meme_id);
                return isNotInExistingMemes;
            })
                .map((meme) => {
                const memeContract = meme.token_id
                    ? meme.token_id
                    : `${meme.symbol}-${meme.meme_id}.meme-cooking.near`.toLowerCase();
                return Object.assign(Object.assign({}, meme), { token_id: memeContract });
            });
            if (newMemes.length) {
                try {
                    (0, homepageController_1.handlePushTelegramNotificationController)({
                        body: newMemes
                            .map((i) => generateTelegramHTMLMemeCook(i))
                            .join("\n\n"),
                    });
                }
                catch (error) {
                    console.log("error :", error);
                }
                // Thêm các meme mới vào mảng hiện có và ghi lại vào file
                existingMemes.unshift(...newMemes);
                // const updatedMemes = [...newMemes, ...existingMemes];
                writeExistingMemes(existingMemes);
            }
            return newMemes;
        }
        catch (error) {
            console.error("Error fetching memes:", error === null || error === void 0 ? void 0 : error.message);
            return [];
        }
    });
}
const cronExpression20s = "*/20 * * * * *";
const cronExpression15s = "*/15 * * * * *";
const cronExpression10s = "*/10 * * * * *";
const checkMemeCooking = new cron_1.CronJob(cronExpression10s, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, common_helper_1.delay)(Math.random() * 1500);
    console.log(`v2 running cron job crawl meme cook ...`);
    fetchActiveMemes();
    return;
}));
exports.checkMemeCooking = checkMemeCooking;
//# sourceMappingURL=meme-cook.cron.js.map