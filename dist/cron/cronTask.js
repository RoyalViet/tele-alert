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
exports.job = exports.checkReleasePoolToken = void 0;
const axios_1 = __importDefault(require("axios"));
const cron_1 = require("cron");
const bigNumber_1 = require("../common/helper/bigNumber");
const common_helper_1 = require("../common/helper/common.helper");
const homepageController_1 = require("../controllers/common/homepageController");
const token_handle_1 = require("../controllers/token/token.handle");
const job = new cron_1.CronJob("*/10 * * * * *", () => {
    // Tác vụ log message
    console.log("Đây là một log message.");
});
exports.job = job;
const checkReleasePoolToken = new cron_1.CronJob("*/10 * * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const contract = "dd.tg";
    const wNearContract = "wrap.near";
    const tokenWNear = "wNEAR";
    console.log(`v2 running cron job crawl pool token ${contract}...`);
    try {
        const raw = yield axios_1.default.get(`https://api.ref.finance/list-pools`, {});
        const listInfoToken = (_a = raw === null || raw === void 0 ? void 0 : raw.data) === null || _a === void 0 ? void 0 : _a.filter((i) => (0, bigNumber_1.bigNumber)(i === null || i === void 0 ? void 0 : i.tvl).gt(0) &&
            (0, bigNumber_1.bigNumber)(i === null || i === void 0 ? void 0 : i.token0_ref_price).gt(0) &&
            (i === null || i === void 0 ? void 0 : i.token_account_ids).includes(wNearContract)
        // ||
        // (i?.token_account_ids as Array<string>).includes(
        //   "usdt.tether-token.near"
        // )
        ).sort((a, b) => ((0, bigNumber_1.bigNumber)(a.tvl).gte(b.tvl) ? -1 : 1)).map((i) => {
            var _a;
            return {
                pool_id: Number(i === null || i === void 0 ? void 0 : i.id),
                token_contract: (_a = i === null || i === void 0 ? void 0 : i.token_account_ids) === null || _a === void 0 ? void 0 : _a.find((i) => i !== wNearContract),
                token_account_ids: i === null || i === void 0 ? void 0 : i.token_account_ids,
                token_symbols: i === null || i === void 0 ? void 0 : i.token_symbols,
                token_price: (0, bigNumber_1.bigNumber)(i === null || i === void 0 ? void 0 : i.token0_ref_price).toNumber(),
                liq: (0, bigNumber_1.bigNumber)(i === null || i === void 0 ? void 0 : i.tvl).toNumber(),
                network: "Near",
            };
        });
        if (listInfoToken.length) {
            listInfoToken.forEach((i) => {
                (0, token_handle_1.alertTokenHandle)(i);
            });
        }
        const filterToken = (_b = raw === null || raw === void 0 ? void 0 : raw.data) === null || _b === void 0 ? void 0 : _b.filter((i) => (0, bigNumber_1.bigNumber)(i === null || i === void 0 ? void 0 : i.tvl).gt(0) &&
            (0, bigNumber_1.bigNumber)(i === null || i === void 0 ? void 0 : i.token0_ref_price).gt(0) &&
            (i === null || i === void 0 ? void 0 : i.token_account_ids).includes(contract) &&
            ((i === null || i === void 0 ? void 0 : i.token_account_ids).includes("wrap.near") ||
                (i === null || i === void 0 ? void 0 : i.token_account_ids).includes("usdt.tether-token.near")));
        const rsFocus = filterToken
            .sort((a, b) => ((0, bigNumber_1.bigNumber)(a.tvl).gte(b.tvl) ? -1 : 1))
            .map((i) => {
            return {
                // ...i,
                id: i === null || i === void 0 ? void 0 : i.id,
                token_account_ids: i === null || i === void 0 ? void 0 : i.token_account_ids,
                token_symbols: i === null || i === void 0 ? void 0 : i.token_symbols,
                token_price: i === null || i === void 0 ? void 0 : i.token0_ref_price,
                liq: (0, bigNumber_1.formatBalance)(i === null || i === void 0 ? void 0 : i.tvl),
            };
        });
        if (rsFocus.length) {
            (0, homepageController_1.handlePushTelegramNotificationController)({
                body: rsFocus.map((i) => (0, common_helper_1.generateTelegramHTML)(i)).join("\n\n"),
            });
        }
    }
    catch (error) {
        console.log(`error: `, error);
        // handlePushTelegramNotificationController({
        //   body: generateTelegramHTML({ error }),
        // });
    }
    return;
}));
exports.checkReleasePoolToken = checkReleasePoolToken;
//# sourceMappingURL=cronTask.js.map