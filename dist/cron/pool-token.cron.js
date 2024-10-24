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
exports.checkReleasePoolToken = exports.fetchAndProcessPools = exports.contract = void 0;
const axios_1 = __importDefault(require("axios"));
const cron_1 = require("cron");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const bigNumber_1 = require("../common/helper/bigNumber");
const common_helper_1 = require("../common/helper/common.helper");
const homepageController_1 = require("../controllers/common/homepageController");
const token_handle_1 = require("../controllers/token/token.handle");
// Đường dẫn tới file chứa các meme
const tokenFilePath = path_1.default.join(process.cwd(), "src", "seeds", "token.seed.json");
// Đường dẫn tới file chứa các meme
const priceTokenPath = path_1.default.join(process.cwd(), "src", "seeds", "price-token.seed.json");
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
const fetchTokenPrices = () => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get(`https://api.ref.finance/list-token-price`);
    return response.data;
});
const processTokenPrice = (listPrice, contract) => {
    var _a;
    const notifications = [];
    if (listPrice[contract]) {
        if ((0, bigNumber_1.bigNumber)((_a = listPrice[contract]) === null || _a === void 0 ? void 0 : _a.price).gt(0) && count < 100) {
            count++;
            notifications.push(listPrice[contract]);
        }
    }
    return notifications;
};
const updatePriceTokenList = (listPrice, listPriceSeed) => {
    const updates = [];
    Object.keys(listPrice).forEach((key) => {
        if (!listPriceSeed[key] && !memeSeed.some((i) => i.token_id === key)) {
            updates.push(Object.assign(Object.assign({}, listPrice[key]), { contract: key }));
            listPriceSeed[key] = Object.assign(Object.assign({}, listPrice[key]), { contract: key });
        }
    });
    return updates;
};
const listPriceSeed = readPriceTokenList();
const fetchAndProcessTokenPrices = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`v2 running cron job crawl price token ${exports.contract}...`);
    try {
        const listPrice = yield fetchTokenPrices();
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
});
const filterValidPools = (data) => {
    return data.filter((i) => (0, bigNumber_1.bigNumber)(i === null || i === void 0 ? void 0 : i.tvl).gt(0) &&
        (0, bigNumber_1.bigNumber)(i === null || i === void 0 ? void 0 : i.token0_ref_price).gt(0) &&
        (i === null || i === void 0 ? void 0 : i.token_account_ids).includes(wNearContract));
};
const createTokenInfo = (pool) => {
    var _a;
    const contract = (_a = pool === null || pool === void 0 ? void 0 : pool.token_account_ids) === null || _a === void 0 ? void 0 : _a.find((i) => i !== wNearContract);
    return {
        token_contract: contract,
        pool_id: Number(pool === null || pool === void 0 ? void 0 : pool.id),
        _: "==============================",
        token_account_ids: pool === null || pool === void 0 ? void 0 : pool.token_account_ids,
        token_symbols: pool === null || pool === void 0 ? void 0 : pool.token_symbols,
        token_price: (0, bigNumber_1.bigNumber)(pool === null || pool === void 0 ? void 0 : pool.token0_ref_price).toNumber(),
        liq: (0, bigNumber_1.bigNumber)(pool === null || pool === void 0 ? void 0 : pool.tvl).toNumber(),
        network: "Near",
        tvl: pool === null || pool === void 0 ? void 0 : pool.tvl,
        __: "==============================",
        TokenLink: `https://nearblocks.io/token/${contract}`,
        RefLink: `https://app.ref.finance/#usdt.tether-token.near|${contract}`,
        DexLink: (pool === null || pool === void 0 ? void 0 : pool.id)
            ? `https://dexscreener.com/near/refv1-${pool === null || pool === void 0 ? void 0 : pool.id}`
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
const memeSeed = readExistingMemes();
const fetchAndProcessPools = () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`v2 running cron job crawl pool token ${exports.contract}...`);
    try {
        const raw = yield axios_1.default.get(`https://api.ref.finance/list-pools`);
        const listInfoToken = filterValidPools(raw.data)
            .map(createTokenInfo)
            .sort((a, b) => ((0, bigNumber_1.bigNumber)(a.tvl).gte(b.tvl) ? -1 : 1));
        // Lọc ra danh sách token mới
        const newInfoTokens = yield Promise.all(listInfoToken
            .filter((t) => {
            return !tokenSeed.some((i) => i.pool_id === t.pool_id);
        })
            .map((t) => __awaiter(void 0, void 0, void 0, function* () {
            const meme = memeSeed.find((i) => (i === null || i === void 0 ? void 0 : i.token_id) === t.token_contract);
            if (!meme) {
                const owner = yield (0, token_handle_1.getSignerFromContract)(t.token_contract);
                return Object.assign({ OwnerLink: `https://nearblocks.io/address/${owner}?tab=tokentxns`, OwnerPikeLink: `https://pikespeak.ai/wallet-explorer/${owner}/transfers`, AddressTokenLink: `https://nearblocks.io/address/${t.token_contract}`, ___: "==============================" }, t);
            }
            else {
                return Object.assign({ OwnerLink: `https://nearblocks.io/address/${meme.owner}?tab=tokentxns`, OwnerPikeLink: `https://pikespeak.ai/wallet-explorer/${meme.owner}/transfers`, ___: "==============================" }, t);
            }
        })));
        // Thêm các token mới vào tokenSeed
        newInfoTokens.forEach((t) => {
            tokenSeed.unshift(t);
        });
        if (newInfoTokens.length) {
            (0, homepageController_1.handlePushTelegramNotificationController)({
                body: newInfoTokens.map((i) => (0, common_helper_1.generateTelegramHTML)(i)).join("\n\n"),
            });
            writeTokenList(tokenSeed);
        }
        const filterToken = raw.data.filter((i) => (0, bigNumber_1.bigNumber)(i === null || i === void 0 ? void 0 : i.tvl).gt(0) &&
            (0, bigNumber_1.bigNumber)(i === null || i === void 0 ? void 0 : i.token0_ref_price).gt(0) &&
            (i === null || i === void 0 ? void 0 : i.token_account_ids).includes(exports.contract) &&
            ((i === null || i === void 0 ? void 0 : i.token_account_ids).includes("wrap.near") ||
                (i === null || i === void 0 ? void 0 : i.token_account_ids).includes("usdt.tether-token.near")));
        const rsFocus = filterToken
            .sort((a, b) => ((0, bigNumber_1.bigNumber)(a.tvl).gte(b.tvl) ? -1 : 1))
            .map((i) => ({
            id: i === null || i === void 0 ? void 0 : i.id,
            token_account_ids: i === null || i === void 0 ? void 0 : i.token_account_ids,
            token_symbols: i === null || i === void 0 ? void 0 : i.token_symbols,
            token_price: i === null || i === void 0 ? void 0 : i.token0_ref_price,
            liq: (0, bigNumber_1.formatBalance)(i === null || i === void 0 ? void 0 : i.tvl),
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
});
exports.fetchAndProcessPools = fetchAndProcessPools;
const cronExpression15s = "*/15 * * * * *";
const cronExpression10s = "*/10 * * * * *";
const checkReleasePoolToken = new cron_1.CronJob(cronExpression10s, () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, common_helper_1.delay)(Math.random() * 1500);
    fetchAndProcessTokenPrices();
    (0, exports.fetchAndProcessPools)();
}));
exports.checkReleasePoolToken = checkReleasePoolToken;
//# sourceMappingURL=pool-token.cron.js.map