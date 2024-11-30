"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMemeTradesCron = exports.checkMemeCooking = exports.isPreListFollowTime = exports.fetchMemeTrades = void 0;
const axios_1 = __importDefault(require("axios"));
const cron_1 = require("cron");
const date_fns_1 = require("date-fns");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bigNumber_1 = require("../common/helper/bigNumber");
const common_helper_1 = require("../common/helper/common.helper");
const homepageController_1 = require("../controllers/common/homepageController");
const const_1 = require("./const");
const pool_token_cron_1 = require("./pool-token.cron");
const infoDepositPath = path_1.default.join(process.cwd(), "src", "seeds", "info-deposit.seed.json");
const readInfoFromFile = () => {
    const data = fs_1.default.readFileSync(infoDepositPath, "utf-8");
    return JSON.parse(data);
};
const writeInfoToFile = (info) => {
    fs_1.default.writeFileSync(infoDepositPath, JSON.stringify(info, null, 2), "utf-8");
};
const fetchMemeTrades = async (memeId, options) => {
    const url = `https://api.meme.cooking/trades?meme_id=${memeId}`;
    try {
        const response = await axios_1.default.get(url, {
            headers: const_1.HEADER_GET_MEME_TRADER,
        });
        const accountMap = {};
        const uniqueIds = new Set();
        const filteredData = response.data.filter((item) => {
            if (uniqueIds.has(item.receipt_id)) {
                return false;
            }
            else {
                uniqueIds.add(item.receipt_id);
                return true;
            }
        });
        filteredData.forEach((trade) => {
            const amountValue = (0, bigNumber_1.bigNumber)(trade.amount).dividedBy(Math.pow(10, 24));
            const feeValue = (0, bigNumber_1.bigNumber)(trade.fee).dividedBy(Math.pow(10, 24));
            if (trade.is_deposit) {
                accountMap[trade.account_id] = (0, bigNumber_1.bigNumber)(accountMap[trade.account_id] || 0)
                    .plus(amountValue)
                    .plus(feeValue);
            }
            else {
                accountMap[trade.account_id] = (0, bigNumber_1.bigNumber)(accountMap[trade.account_id])
                    .minus(amountValue)
                    .minus(feeValue);
            }
        });
        const result = Object.entries(accountMap).map(([account_id, amount]) => ({
            account_id,
            amount,
        }));
        const totalAmount = result.reduce((sum, item) => sum.plus(item.amount), new bigNumber_1.BigNumber(0));
        if (totalAmount.isZero()) {
            return;
        }
        const sortedResult = result
            .sort((a, b) => options?.isSortDown
            ? b.amount.minus(a.amount).toNumber()
            : a.amount.minus(b.amount).toNumber())
            .map((i) => {
            const percent = i.amount.dividedBy(totalAmount).multipliedBy(100);
            return {
                ...i,
                amount: (0, bigNumber_1.formatBalance)(i.amount) + " Near",
                percent: percent.toFixed(2) + " %",
                numberOfTokens: `Σ1B => ≈ ${(0, common_helper_1.formatBigNumberByUnit)((0, bigNumber_1.bigNumber)(1000000000).multipliedBy(percent).dividedBy(100))}`,
            };
        });
        console.log(sortedResult, (0, bigNumber_1.formatBalance)(totalAmount, 2) + " Near");
        const existingData = readInfoFromFile();
        const updatedData = [
            [
                memeId,
                (0, bigNumber_1.formatBalance)(totalAmount, 2) + " Near",
                ...sortedResult
                    .sort((a, b) => (0, bigNumber_1.bigNumber)(b.percent.split(" ")[0])
                    .minus(a.percent.split(" ")[0])
                    .toNumber())
                    .map((i, index) => ({ top: index + 1, ...i })),
            ],
            ...existingData.filter((i) => !i.includes(memeId)),
        ];
        writeInfoToFile(updatedData);
        return totalAmount;
    }
    catch (error) {
        console.error("Error fetching meme trades:", error?.message);
    }
};
exports.fetchMemeTrades = fetchMemeTrades;
const idsPath = path_1.default.join(process.cwd(), "src", "seeds", "ids-meme-full-cap.seed.json");
const readMemeIdsFromFile = () => {
    if (fs_1.default.existsSync(idsPath)) {
        const data = fs_1.default.readFileSync(idsPath, "utf-8"); // Đọc file
        const memeIdArray = JSON.parse(data);
        return new Set(memeIdArray);
    }
    return new Set();
};
const writeMemeIdsToFile = () => {
    const memeIdArray = Array.from(sentMemeIds);
    fs_1.default.writeFileSync(idsPath, JSON.stringify(memeIdArray, null, 2), "utf-8");
};
const sentMemeIds = readMemeIdsFromFile();
const filePath = path_1.default.join(process.cwd(), "src", "seeds", "meme-cook.seed.json");
function readExistingMemes() {
    if (!fs_1.default.existsSync(filePath)) {
        return [];
    }
    const data = fs_1.default.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}
function writeExistingMemes(memes) {
    fs_1.default.writeFileSync(filePath, JSON.stringify(memes, null, 2), "utf8");
}
function generateTelegramHTMLMemeCook(meme) {
    const decimals = meme.decimals || 18; // Mặc định là 18 nếu không có
    const totalSupply = (0, bigNumber_1.bigNumber)(meme.total_supply)
        .dividedBy(Math.pow(10, decimals))
        .toFixed(2);
    const teamAllocation = (0, bigNumber_1.bigNumber)(meme.team_allocation || 0)
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
        "⭐ Contract": memeContract,
        "⭐ PoolID": meme.pool_id || "N/A",
        TotalDeposit: `${(0, bigNumber_1.formatBalance)(totalDeposit)} Near`,
        HardCap: `${(0, bigNumber_1.formatBalance)(hardCap)} Near`,
        Decimals: meme.decimals,
        MemeLink: `https://meme.cooking/meme/${meme.meme_id}`,
        _: "==============================",
        "⭐ OwnerLink": `https://nearblocks.io/address/${meme.owner}?tab=tokentxns`,
        XLink: `https://x.com/search?q=${meme.owner}&src=typed_query`,
        TokenLink: `https://nearblocks.io/token/${memeContract}`,
        "⭐ RefLink": `https://app.ref.finance/#usdt.tether-token.near|${memeContract}`,
        "⭐ DexLink": meme.pool_id
            ? `https://dexscreener.com/near/refv1-${meme.pool_id}`
            : "N/A",
        __: "==============================",
        Twitter: meme.twitterLink || "N/A",
        Telegram: meme.telegramLink || "N/A",
        Website: meme.website || "N/A",
        ___: "==============================",
        TotalSupply: `${(0, bigNumber_1.formatBalance)(totalSupply)}`,
        "⭐ TeamAllocation": meme.team_allocation
            ? `${(0, bigNumber_1.formatBalance)((0, bigNumber_1.bigNumber)(teamAllocation)
                .dividedBy(totalSupply)
                .multipliedBy(100)
                .toFixed(2))}% - ${(0, bigNumber_1.formatBalance)(teamAllocation)}`
            : "N/A",
        CliffEnd: `${Number(meme.cliff_duration_ms) / (1000 * 60 * 60 * 24)} days`,
        Vesting: `${Number(meme.vesting_duration_ms) / (1000 * 60 * 60 * 24)} days`,
        SoftCap: `${(0, bigNumber_1.formatBalance)(softCap)} Near`,
        ID: meme.meme_id,
        Name: meme.name,
        Symbol: meme.symbol,
        // Description: meme.description || "N/A",
        // Image: `https://plum-necessary-chameleon-942.mypinata.cloud/ipfs/${meme.image}`,
        Tag: "From Meme Cooking",
    };
    return (0, common_helper_1.generateTelegramHTML)(memeDetails);
}
const existingMemes = readExistingMemes();
const ownerIgnore = [
    "tokenlab.near",
    "memecoinscash.near",
    "mina_yoshizawa.near",
    "jav_idol.near",
    "w3_lab.tg",
    "wink_gambler.tg",
    "tigbitties.nea",
    "memechief.near",
];
const isPreListFollowTime = (targetTime) => {
    try {
        const now = Date.now();
        const distance = targetTime - now;
        const duration = (0, date_fns_1.intervalToDuration)({ start: now, end: targetTime });
        if (distance > 0 && distance < 10 * 60 * 1000) {
            console.log("rs :", (0, date_fns_1.formatDuration)(duration, {
                format: ["years", "months", "days", "hours", "minutes", "seconds"],
            }));
        }
        return distance > 0 && distance < 10 * 60 * 1000;
    }
    catch (error) {
        return false;
    }
};
exports.isPreListFollowTime = isPreListFollowTime;
const checkPreList = (meme) => {
    try {
        const totalDeposit = (0, bigNumber_1.bigNumber)(meme.total_deposit)
            .dividedBy(Math.pow(10, 24))
            .toFixed(2);
        const softCap = (0, bigNumber_1.bigNumber)(meme.soft_cap)
            .dividedBy(Math.pow(10, 24))
            .toFixed(2);
        const hardCap = (0, bigNumber_1.bigNumber)(meme.hard_cap || 0)
            .dividedBy(Math.pow(10, 24))
            .toFixed(2);
        if ((0, bigNumber_1.bigNumber)(totalDeposit).plus(20).gte(softCap) &&
            (0, exports.isPreListFollowTime)(Number(meme.end_timestamp_ms))) {
            return true;
        }
        else if (meme?.hard_cap &&
            (0, bigNumber_1.bigNumber)(totalDeposit).plus(60).gte(hardCap) &&
            meme?.end_timestamp_ms - new Date().getTime() > 0) {
            return true;
        }
    }
    catch (error) {
        return false;
    }
};
async function fetchActiveMemes() {
    try {
        const response = await axios_1.default.get("https://api.meme.cooking/meme", {
            headers: const_1.HEADER_MEME_COOK,
        });
        const activeMemes = response.data;
        response.data.forEach((m) => {
            //
            if (checkPreList(m) && !sentMemeIds.has(m.meme_id)) {
                (0, homepageController_1.handlePushTelegramNotificationController)({
                    body: generateTelegramHTMLMemeCook(m),
                });
                if (!m.pool_id) {
                    (0, pool_token_cron_1.fetchAndProcessPools)();
                }
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
            if (ownerIgnore.includes(meme.owner)) {
                return {
                    meme_id: meme.meme_id,
                    ca: meme.token_id ||
                        `${meme.symbol}-${meme.meme_id}.meme-cooking.near`.toLowerCase(),
                    owner: meme.owner,
                };
            }
            else {
                const memeContract = meme.token_id
                    ? meme.token_id
                    : `${meme.symbol}-${meme.meme_id}.meme-cooking.near`.toLowerCase();
                return { ...meme, token_id: memeContract };
            }
        });
        if (newMemes.length) {
            try {
                if (newMemes.filter((i) => !ownerIgnore.includes(i.owner)).length) {
                    (0, homepageController_1.handlePushTelegramNotificationController)({
                        body: newMemes
                            .filter((i) => !ownerIgnore.includes(i.owner))
                            .map((i) => generateTelegramHTMLMemeCook(i))
                            .join("\n\n"),
                    });
                }
            }
            catch (error) {
                console.log("error :", error);
            }
            existingMemes.unshift(...newMemes);
            writeExistingMemes(existingMemes);
        }
        return newMemes;
    }
    catch (error) {
        console.error("Error fetching memes:", error?.message);
        return [];
    }
}
const cronExpression20s = "*/20 * * * * *";
const cronExpression15s = "*/15 * * * * *";
const cronExpression10s = "*/10 * * * * *";
const cronExpression5s = "*/5 * * * * *";
const checkMemeCooking = new cron_1.CronJob(cronExpression10s, async () => {
    await (0, common_helper_1.delay)(Math.random() * 1500);
    console.log(`v2 running cron job crawl meme cook ...`);
    fetchActiveMemes();
    return;
});
exports.checkMemeCooking = checkMemeCooking;
const getMemeTradesCron = (memeId, options) => {
    return new cron_1.CronJob(cronExpression5s, () => {
        (0, exports.fetchMemeTrades)(memeId, options);
    });
};
exports.getMemeTradesCron = getMemeTradesCron;
//# sourceMappingURL=meme-cook.cron.js.map