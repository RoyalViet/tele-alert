"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.alertTokenHandle = exports.createTokenHandle = void 0;
exports.getSignerAccountId = getSignerAccountId;
exports.getTransactionHash = getTransactionHash;
exports.getSignerFromContract = getSignerFromContract;
const axios_1 = __importDefault(require("axios"));
// Services
const tokenService = __importStar(require("../../services/token/token.service"));
const telegramService = __importStar(require("../../services/telegram/telegramService"));
const bigNumber_1 = require("../../common/helper/bigNumber");
const pool_token_cron_1 = require("../../cron/pool-token.cron");
// Utilities
const createTokenHandle = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = yield tokenService.createToken(params);
    }
    catch (e) {
        //
    }
});
exports.createTokenHandle = createTokenHandle;
const telegramAlertToken = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield telegramService.sendNotification(Object.assign(Object.assign({}, params), { pool_id: params.pool_id, token_account_ids: params.token_account_ids, token_symbols: params.token_symbols, token_price: (0, bigNumber_1.formatBalance)(params.token_price), liq: (0, bigNumber_1.formatBalance)(params.liq) }), {
            isGenerateTelegramHTML: true,
        });
    }
    catch (error) { }
});
const alertTokenHandle = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        telegramAlertToken(params);
    }
    catch (error) {
        if (params.token_contract === pool_token_cron_1.contract) {
            yield telegramAlertToken(params);
        }
    }
});
exports.alertTokenHandle = alertTokenHandle;
function getSignerAccountId(transactionHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://nearblocks.io/_next/data/nearblocks/en/txns/${transactionHash}.json?hash=${transactionHash}`;
        const headers = {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            // cookie:
            //   "_ga=GA1.1.734901468.1704366077; rpcUrl=https://beta.rpc.mainnet.near.org; _ga_BWQNL2NX10=GS1.1.1729555440.546.1.1729556059.0.0.0",
            // pragma: "no-cache",
            // priority: "u=1, i",
            // referer: `https://nearblocks.io/txns/${transactionHash}`,
            // "sec-ch-ua":
            //   '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            // "sec-ch-ua-mobile": "?0",
            // "sec-ch-ua-platform": '"macOS"',
            // "sec-fetch-dest": "empty",
            // "sec-fetch-mode": "cors",
            // "sec-fetch-site": "same-origin",
            // "user-agent":
            //   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
            // "x-nextjs-data": "1",
        };
        try {
            const response = yield axios_1.default.get(url, { headers });
            if (response.status === 200) {
                return response.data.pageProps.data.txns[0].signer_account_id;
            }
        }
        catch (error) {
            console.error("Error fetching signer account ID:", error === null || error === void 0 ? void 0 : error.message);
        }
        return null;
    });
}
function getTransactionHash(contract) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `https://nearblocks.io/_next/data/nearblocks/en/address/${contract}.json/`;
        const headers = {
            accept: "*/*",
            "accept-language": "en-US,en;q=0.9",
            "cache-control": "no-cache",
            pragma: "no-cache",
        };
        try {
            const response = yield axios_1.default.get(url, { headers });
            const transactionHash = response.data.pageProps.contractData.deployments[0].transaction_hash;
            return transactionHash;
        }
        catch (error) {
            console.error("Error fetching transaction hash:", error === null || error === void 0 ? void 0 : error.message);
            return null;
        }
    });
}
function getSignerFromContract(contract) {
    return __awaiter(this, void 0, void 0, function* () {
        const transactionHash = yield getTransactionHash(contract);
        if (transactionHash) {
            return yield getSignerAccountId(transactionHash);
        }
        return null;
    });
}
// example
//# sourceMappingURL=token.handle.js.map