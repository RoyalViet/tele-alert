"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMinStorageBalance = exports.DCLSwapGetStorageBalance = exports.refDCLSwapViewFunction = exports.nearWithdrawTransaction = exports.nearDepositTransaction = exports.getAccountNearBalance = exports.getUserRegisteredTokens = exports.getGlobalWhitelist = exports.ftGetTokensMetadata = exports.ftGetTokenMetadata = exports.getTotalPools = exports.ftGetBalance = exports.ftGetStorageBalance = exports.ftViewFunction = exports.refFiViewFunction = exports.init_env = exports.REPLACE_TOKENS = void 0;
const near_api_js_1 = require("near-api-js");
const constant_1 = require("./constant");
const error_1 = require("./error");
const near_1 = require("./near");
const constant_2 = require("./constant");
const metaIcons_1 = __importDefault(require("./metaIcons"));
const BANANA_ID = "berryclub.ek.near";
const CHEDDAR_ID = "token.cheddar.near";
const CUCUMBER_ID = "farm.berryclub.ek.near";
const HAPI_ID = "d9c2d319cd7e6177336b0a9c93c21cb48d84fb54.factory.bridge.near";
const WOO_ID = "4691937a7508860f876c9c0a2a617e7d9e945d4b.factory.bridge.near";
exports.REPLACE_TOKENS = [
    BANANA_ID,
    CHEDDAR_ID,
    CUCUMBER_ID,
    HAPI_ID,
    WOO_ID,
];
let near = new near_api_js_1.Near({
    keyStore: (0, near_1.getKeyStore)(),
    headers: {},
    ...(0, constant_1.getConfig)(),
});
const init_env = (env, indexerUrl) => {
    near = new near_api_js_1.Near({
        keyStore: (0, near_1.getKeyStore)(),
        headers: {},
        ...(0, constant_1.getConfig)(env, indexerUrl),
    });
    return (0, constant_1.switchEnv)();
};
exports.init_env = init_env;
const refFiViewFunction = async ({ methodName, args, }) => {
    const nearConnection = await near.account(constant_1.REF_FI_CONTRACT_ID);
    return nearConnection.viewFunction({
        contractId: constant_1.REF_FI_CONTRACT_ID,
        methodName,
        args,
    });
};
exports.refFiViewFunction = refFiViewFunction;
const ftViewFunction = async (tokenId, { methodName, args }) => {
    const nearConnection = await near.account(constant_1.REF_FI_CONTRACT_ID);
    return nearConnection.viewFunction({ contractId: tokenId, methodName, args });
};
exports.ftViewFunction = ftViewFunction;
const ftGetStorageBalance = (tokenId, AccountId) => {
    if (!AccountId)
        throw error_1.NoAccountIdFound;
    return (0, exports.ftViewFunction)(tokenId, {
        methodName: "storage_balance_of",
        args: { account_id: AccountId },
    });
};
exports.ftGetStorageBalance = ftGetStorageBalance;
const ftGetBalance = async (tokenId, AccountId) => {
    if (!AccountId)
        return "0";
    if (tokenId === "NEAR") {
        return (0, exports.getAccountNearBalance)(AccountId).catch(() => "0");
    }
    return (0, exports.ftViewFunction)(tokenId, {
        methodName: "ft_balance_of",
        args: {
            account_id: AccountId,
        },
    })
        .then((res) => {
        return res;
    })
        .catch(() => "0");
};
exports.ftGetBalance = ftGetBalance;
const getTotalPools = async () => {
    return (0, exports.refFiViewFunction)({
        methodName: "get_number_of_pools",
    });
};
exports.getTotalPools = getTotalPools;
const ftGetTokenMetadata = async (id, tag) => {
    if (id === constant_2.REF_TOKEN_ID)
        return constant_2.REF_META_DATA;
    const metadata = await (0, exports.ftViewFunction)(id, {
        methodName: "ft_metadata",
    }).catch(() => {
        throw (0, error_1.TokenNotExistError)(id);
    });
    if (!metadata.icon ||
        id === BANANA_ID ||
        id === CHEDDAR_ID ||
        id === CUCUMBER_ID ||
        id === HAPI_ID ||
        id === WOO_ID ||
        id === constant_1.WRAP_NEAR_CONTRACT_ID) {
        return {
            ...metadata,
            icon: metaIcons_1.default[id],
            id,
        };
    }
    return { ...metadata, id };
};
exports.ftGetTokenMetadata = ftGetTokenMetadata;
const ftGetTokensMetadata = async (tokenIds, allTokens) => {
    const ids = tokenIds || (await (0, exports.getGlobalWhitelist)());
    const tokensMetadata = await Promise.all(ids.map((id) => allTokens?.[id] || (0, exports.ftGetTokenMetadata)(id).catch(() => null)));
    return tokensMetadata.reduce((pre, cur, i) => {
        return {
            ...pre,
            [ids[i]]: cur,
        };
    }, {});
};
exports.ftGetTokensMetadata = ftGetTokensMetadata;
const getGlobalWhitelist = async () => {
    const globalWhitelist = await (0, exports.refFiViewFunction)({
        methodName: "get_whitelisted_tokens",
    });
    return Array.from(new Set(globalWhitelist));
};
exports.getGlobalWhitelist = getGlobalWhitelist;
const getUserRegisteredTokens = async (AccountId) => {
    if (!AccountId)
        return [];
    return (0, exports.refFiViewFunction)({
        methodName: "get_user_whitelisted_tokens",
        args: { account_id: AccountId },
    });
};
exports.getUserRegisteredTokens = getUserRegisteredTokens;
const getAccountNearBalance = async (accountId) => {
    const provider = new near_api_js_1.providers.JsonRpcProvider({
        url: (0, constant_1.getConfig)().nodeUrl,
    });
    return provider
        .query({
        request_type: "view_account",
        finality: "final",
        account_id: accountId,
    })
        .then((data) => data.amount);
};
exports.getAccountNearBalance = getAccountNearBalance;
const nearDepositTransaction = (amount) => {
    const transaction = {
        receiverId: constant_1.WRAP_NEAR_CONTRACT_ID,
        functionCalls: [
            {
                methodName: "near_deposit",
                args: {},
                gas: "50000000000000",
                amount,
            },
        ],
    };
    return transaction;
};
exports.nearDepositTransaction = nearDepositTransaction;
const nearWithdrawTransaction = (amount) => {
    const transaction = {
        receiverId: constant_1.WRAP_NEAR_CONTRACT_ID,
        functionCalls: [
            {
                methodName: "near_withdraw",
                args: { amount: near_api_js_1.utils.format.parseNearAmount(amount) },
                amount: constant_2.ONE_YOCTO_NEAR,
            },
        ],
    };
    return transaction;
};
exports.nearWithdrawTransaction = nearWithdrawTransaction;
const refDCLSwapViewFunction = async ({ methodName, args, }) => {
    const nearConnection = await near.account(constant_1.REF_FI_CONTRACT_ID);
    if (!constant_1.config.REF_DCL_SWAP_CONTRACT_ID)
        throw error_1.DCLInValid;
    return nearConnection.viewFunction({
        contractId: constant_1.config.REF_DCL_SWAP_CONTRACT_ID,
        methodName,
        args,
    });
};
exports.refDCLSwapViewFunction = refDCLSwapViewFunction;
const DCLSwapGetStorageBalance = (tokenId, AccountId) => {
    return (0, exports.refDCLSwapViewFunction)({
        methodName: "storage_balance_of",
        args: { account_id: AccountId },
    });
};
exports.DCLSwapGetStorageBalance = DCLSwapGetStorageBalance;
const getMinStorageBalance = async (nep141Address) => {
    try {
        const provider = new near_api_js_1.providers.JsonRpcProvider({
            url: (0, constant_1.getConfig)().nodeUrl,
        });
        const result = await provider.query({
            request_type: "call_function",
            account_id: nep141Address,
            method_name: "storage_balance_bounds",
            args_base64: "",
            finality: "optimistic",
        });
        const balance = JSON.parse(Buffer.from(result.result).toString());
        if (!balance || !balance.min)
            return constant_1.FT_MINIMUM_STORAGE_BALANCE_LARGE;
        return balance.min;
    }
    catch (e) {
        console.error(e, nep141Address);
        return constant_1.FT_MINIMUM_STORAGE_BALANCE_LARGE;
    }
};
exports.getMinStorageBalance = getMinStorageBalance;
//# sourceMappingURL=ref.js.map