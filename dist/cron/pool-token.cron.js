"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkReleasePoolToken = exports.fetchAndProcessPools = exports.contract = void 0;
const axios_1 = __importDefault(require("axios"));
const cron_1 = require("cron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bigNumber_1 = require("../common/helper/bigNumber");
const common_helper_1 = require("../common/helper/common.helper");
const homepageController_1 = require("../controllers/common/homepageController");
const token_handle_1 = require("../controllers/token/token.handle");
const ref_finance_controller_1 = require("../controllers/ref-finance/ref-finance.controller");
// Đường dẫn tới file chứa các meme
const priceTokenPath = path_1.default.join(process.cwd(), "src", "seeds", "price-token.seed.json");
// Đường dẫn tới file chứa các meme
const tokenFilePath = path_1.default.join(process.cwd(), "src", "seeds", "token.seed.json");
// Hàm để đọc danh sách token từ file
const readTokenList = () => {
    if (fs_1.default.existsSync(tokenFilePath)) {
        const data = fs_1.default.readFileSync(tokenFilePath, "utf-8");
        return JSON.parse(data);
    }
    return [];
};
// Hàm để ghi danh sách token vào file
const writeTokenList = (tokenList) => {
    fs_1.default.writeFileSync(tokenFilePath, JSON.stringify(tokenList, null, 2), "utf-8");
};
//
const readPriceTokenList = () => {
    if (fs_1.default.existsSync(priceTokenPath)) {
        const data = fs_1.default.readFileSync(priceTokenPath, "utf-8");
        return JSON.parse(data);
    }
    return {};
};
// Hàm để ghi danh sách token vào file
const writePriceTokenList = (tokenList) => {
    fs_1.default.writeFileSync(priceTokenPath, JSON.stringify(tokenList, null, 2), "utf-8");
};
let count = 1;
const MAX_COUNT = 2;
exports.contract = "game.hot.tg";
const wNearContract = "wrap.near";
const fetchTokenPrices = async () => {
    const response = await axios_1.default.get(`https://api.ref.finance/list-token-price`);
    return response.data;
};
const processTokenPrice = (listPrice, contract) => {
    const notifications = [];
    if (listPrice[contract]) {
        if ((0, bigNumber_1.bigNumber)(listPrice[contract]?.price).gt(0) && count < 100) {
            count++;
            notifications.push(listPrice[contract]);
        }
    }
    return notifications;
};
const updatePriceTokenList = (listPrice, listPriceSeed) => {
    const memeSeed = readExistingMemes();
    const updates = [];
    Object.keys(listPrice).forEach((key) => {
        if (!listPriceSeed[key] && !memeSeed.some((i) => i.token_id === key)) {
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
const fetchAndProcessTokenPrices = async () => {
    console.log(`v2 running cron job crawl price token ${exports.contract}...`);
    try {
        const listPrice = await fetchTokenPrices();
        const notifications = processTokenPrice(listPrice, exports.contract);
        if (notifications.length) {
            (0, homepageController_1.handlePushTelegramNotificationController)({
                body: notifications
                    .map((i) => (0, common_helper_1.generateTelegramHTML)(i))
                    .join("\n\n"),
            });
        }
        const updates = updatePriceTokenList(listPrice, listPriceSeed);
        if (updates.length) {
            (0, homepageController_1.handlePushTelegramNotificationController)({
                body: updates.map((i) => (0, common_helper_1.generateTelegramHTML)(i)).join("\n\n"),
            });
            writePriceTokenList(listPriceSeed);
        }
    }
    catch (error) {
        console.error("Error fetching token prices:", error.message);
    }
};
const filterValidPools = (data) => {
    return data.filter((i) => (0, bigNumber_1.bigNumber)(i?.tvl).gt(0) &&
        (0, bigNumber_1.bigNumber)(i?.token0_ref_price).gt(0) &&
        (i?.token_account_ids).includes(wNearContract));
};
const createTokenInfo = (pool) => {
    const contract = pool?.token_account_ids?.find((i) => i !== wNearContract);
    return {
        token_contract: contract,
        pool_id: Number(pool?.id),
        _: "==============================",
        token_account_ids: pool?.token_account_ids,
        token_symbols: pool?.token_symbols,
        token_price: (0, bigNumber_1.bigNumber)(pool?.token0_ref_price).toNumber(),
        liq: (0, bigNumber_1.bigNumber)(pool?.tvl).toNumber(),
        network: "Near",
        tvl: pool?.tvl,
        __: "==============================",
        TokenLink: `https://nearblocks.io/token/${contract}`,
        RefLink: `https://app.ref.finance/#usdt.tether-token.near|${contract}`,
        DexLink: pool?.id
            ? `https://dexscreener.com/near/refv1-${pool?.id}`
            : "N/A",
    };
};
// Đường dẫn tới file chứa các meme
const memePath = path_1.default.join(process.cwd(), "src", "seeds", "meme-cook.seed.json");
// Hàm để đọc các meme từ file
function readExistingMemes() {
    if (!fs_1.default.existsSync(memePath)) {
        return [];
    }
    const data = fs_1.default.readFileSync(memePath, "utf8");
    return JSON.parse(data);
}
const tokenSeed = readTokenList();
const fetchAndProcessPools = async () => {
    console.log(`v2 running cron job crawl pool token ${exports.contract}...`);
    try {
        const raw = await axios_1.default.get(`https://api.ref.finance/list-pools`);
        const listInfoToken = filterValidPools(raw.data)
            .map(createTokenInfo)
            .sort((a, b) => ((0, bigNumber_1.bigNumber)(a.tvl).gte(b.tvl) ? -1 : 1));
        const memeSeed = readExistingMemes();
        const memeMap = new Map(memeSeed.map((meme) => [meme.token_id, meme]));
        const newInfoTokens = await Promise.all(listInfoToken
            .filter((t) => !tokenSeed.some((i) => i.pool_id === t.pool_id))
            .map(async (t) => {
            const meme = memeMap.get(t.token_contract);
            if (!meme) {
                try {
                    const [info, owner] = await Promise.all([
                        (0, ref_finance_controller_1.getTokenDetail)(t.token_contract),
                        (0, token_handle_1.getSignerFromContract)(t.token_contract),
                    ]);
                    return {
                        OwnerLink: owner && owner !== "null"
                            ? `[${owner}](https://nearblocks.io/address/${owner}?tab=tokentxns)`
                            : "N/A",
                        OwnerPikeLink: owner && owner !== "null"
                            ? `[${owner}](https://pikespeak.ai/wallet-explorer/${owner}/transfers)`
                            : "N/A",
                        AddressTokenLink: `https://nearblocks.io/address/${t.token_contract}`,
                        ___: "==============================",
                        ...t,
                        decimals: info.decimals,
                    };
                }
                catch (error) {
                    return {
                        OwnerLink: "N/A",
                        AddressTokenLink: "N/A",
                        ...t,
                        decimals: "N/A",
                    };
                }
            }
            else {
                const totalDeposit = (0, bigNumber_1.bigNumber)(meme.total_deposit)
                    .dividedBy(Math.pow(10, 24))
                    .toFixed(2);
                const hardCap = (0, bigNumber_1.bigNumber)(meme.hard_cap || 0)
                    .dividedBy(Math.pow(10, 24))
                    .toFixed(2);
                return {
                    OwnerLink: `[${meme.owner}](https://nearblocks.io/address/${meme.owner}?tab=tokentxns)`,
                    OwnerPikeLink: `[${meme.owner}](https://pikespeak.ai/wallet-explorer/${meme.owner}/transfers)`,
                    TotalDeposit: `${(0, bigNumber_1.formatBalance)(totalDeposit)} Near`,
                    HardCap: `${(0, bigNumber_1.formatBalance)(hardCap)} Near`,
                    ___: "==============================",
                    ...t,
                    decimals: meme.decimals,
                };
            }
        }));
        tokenSeed.unshift(...newInfoTokens.filter(Boolean));
        if (newInfoTokens.length) {
            (0, homepageController_1.handlePushTelegramNotificationController)({
                body: newInfoTokens.map((i) => (0, common_helper_1.generateTelegramHTML)(i)).join("\n\n"),
            });
            writeTokenList(tokenSeed);
        }
        const filterToken = raw.data.filter((i) => (0, bigNumber_1.bigNumber)(i?.tvl).gt(0) &&
            (0, bigNumber_1.bigNumber)(i?.token0_ref_price).gt(0) &&
            (i?.token_account_ids).includes(exports.contract) &&
            ((i?.token_account_ids).includes("wrap.near") ||
                (i?.token_account_ids).includes("usdt.tether-token.near")));
        const rsFocus = filterToken
            .sort((a, b) => ((0, bigNumber_1.bigNumber)(a.tvl).gte(b.tvl) ? -1 : 1))
            .map((i) => ({
            id: i?.id,
            token_account_ids: i?.token_account_ids,
            token_symbols: i?.token_symbols,
            token_price: i?.token0_ref_price,
            liq: (0, bigNumber_1.formatBalance)(i?.tvl),
        }));
        if (rsFocus.length && count < MAX_COUNT) {
            count++;
            (0, homepageController_1.handlePushTelegramNotificationController)({
                body: rsFocus.map((i) => (0, common_helper_1.generateTelegramHTML)(i)).join("\n\n"),
            });
        }
    }
    catch (error) {
        console.error("Error fetching pools:", error.message);
    }
};
exports.fetchAndProcessPools = fetchAndProcessPools;
const cronExpression15s = "*/15 * * * * *";
const cronExpression10s = "*/10 * * * * *";
const checkReleasePoolToken = new cron_1.CronJob(cronExpression15s, async () => {
    await (0, common_helper_1.delay)(Math.random() * 1500);
    // fetchAndProcessTokenPrices();
    (0, exports.fetchAndProcessPools)();
});
exports.checkReleasePoolToken = checkReleasePoolToken;
//# sourceMappingURL=pool-token.cron.js.map