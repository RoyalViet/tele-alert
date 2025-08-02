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
const common_helper_1 = require("../../common/helper/common.helper");
// Utilities
const createTokenHandle = async (params) => {
    try {
        const token = await tokenService.createToken(params);
    }
    catch (e) {
        //
    }
};
exports.createTokenHandle = createTokenHandle;
const telegramAlertToken = async (params) => {
    try {
        await telegramService.sendNotification((0, common_helper_1.generateTelegramHTML)({
            ...params,
            pool_id: params.pool_id,
            token_account_ids: params.token_account_ids,
            token_symbols: params.token_symbols,
            token_price: (0, bigNumber_1.formatBalance)(params.token_price),
            liq: (0, bigNumber_1.formatBalance)(params.liq),
        }));
    }
    catch (error) { }
};
const alertTokenHandle = async (params) => {
    try {
        telegramAlertToken(params);
    }
    catch (error) {
        if (params.token_contract === pool_token_cron_1.contract) {
            await telegramAlertToken(params);
        }
    }
};
exports.alertTokenHandle = alertTokenHandle;
async function getSignerAccountId(transactionHash) {
    const url = `https://nearblocks.io/_next/data/nearblocks/en/txns/${transactionHash}.json?hash=${transactionHash}`;
    const headers = {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
    };
    try {
        const response = await axios_1.default.get(url, { headers });
        if (response.status === 200) {
            return response.data.pageProps.data.txns[0].signer_account_id;
        }
    }
    catch (error) {
        console.error("Error fetching signer account ID:", error?.message);
    }
    return null;
}
async function getTransactionHash(contract) {
    const url = `https://nearblocks.io/_next/data/nearblocks/en/address/${contract}.json/`;
    const headers = {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        pragma: "no-cache",
    };
    try {
        const response = await axios_1.default.get(url, { headers });
        const transactionHash = response.data.pageProps.contractData.deployments[0].transaction_hash;
        return transactionHash;
    }
    catch (error) {
        console.error("Error fetching transaction hash:", error?.message);
        return null;
    }
}
async function getSignerFromContract(contract) {
    const transactionHash = await getTransactionHash(contract);
    if (transactionHash) {
        return await getSignerAccountId(transactionHash);
    }
    return null;
}
// example
//# sourceMappingURL=token.handle.js.map