"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransactionsByMemoryKey = exports.getSignedTransactionsByMemoryKey = exports.getMemorySigner = exports.provider = exports.getKeyStore = void 0;
const near_api_js_1 = require("near-api-js");
const bn_js_1 = __importDefault(require("bn.js"));
const constant_1 = require("./constant");
const fs_1 = __importDefault(require("fs"));
const error_1 = require("./error");
const utils_1 = require("./utils");
const error_2 = require("./error");
const getKeyStore = () => {
    return typeof window === "undefined"
        ? new near_api_js_1.keyStores.InMemoryKeyStore()
        : new near_api_js_1.keyStores.BrowserLocalStorageKeyStore();
};
exports.getKeyStore = getKeyStore;
exports.provider = new near_api_js_1.providers.JsonRpcProvider({
    url: (0, constant_1.getConfig)().nodeUrl,
});
const getMemorySigner = async ({ AccountId, keyPath, }) => {
    try {
        // const homedir = os.homedir();
        const credentials = JSON.parse(fs_1.default.readFileSync(keyPath).toString());
        const credentialAccountId = credentials?.account_id;
        if (!credentialAccountId)
            throw error_1.NoCredential;
        if (credentialAccountId !== AccountId)
            throw error_2.AccountIdMisMatch;
        const myKeyStore = new near_api_js_1.keyStores.InMemoryKeyStore();
        myKeyStore.setKey((0, constant_1.getConfig)().networkId, AccountId, near_api_js_1.KeyPair.fromString(credentials.private_key));
        const signer = new near_api_js_1.InMemorySigner(myKeyStore);
        return signer;
    }
    catch (error) {
        throw error;
    }
};
exports.getMemorySigner = getMemorySigner;
const validateAccessKey = (transaction, accessKey) => {
    if (accessKey.permission === "FullAccess") {
        return accessKey;
    }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { receiver_id, method_names } = accessKey.permission.FunctionCall;
    if (transaction.receiverId !== receiver_id) {
        return null;
    }
    return transaction.actions.every((action) => {
        if (action.type !== "FunctionCall") {
            return false;
        }
        const { methodName, deposit } = action.params;
        if (method_names.length && method_names.includes(methodName)) {
            return false;
        }
        return parseFloat(deposit) <= 0;
    });
};
const getSignedTransactionsByMemoryKey = async ({ transactionsRef, AccountId, keyPath, }) => {
    const transactions = (0, utils_1.transformTransactions)(transactionsRef, AccountId);
    const block = await exports.provider.block({ finality: "final" });
    const signedTransactions = [];
    const signer = await (0, exports.getMemorySigner)({
        AccountId,
        keyPath,
    });
    for (let i = 0; i < transactions.length; i += 1) {
        const transaction = transactions[i];
        const publicKey = await signer.getPublicKey(AccountId, (0, constant_1.getConfig)().networkId);
        if (!publicKey) {
            throw error_1.NoPuiblicKeyError;
        }
        const accessKey = await exports.provider.query({
            request_type: "view_access_key",
            finality: "final",
            account_id: AccountId,
            public_key: publicKey.toString(),
        });
        if (!validateAccessKey(transaction, accessKey)) {
            throw error_1.InValidAccessKeyError;
        }
        const tx = near_api_js_1.transactions.createTransaction(AccountId, near_api_js_1.utils.PublicKey.from(publicKey.toString()), transactions[i].receiverId, accessKey.nonce + BigInt(i + 1), transaction.actions.map((action) => {
            const { methodName, args, gas, deposit } = action.params;
            return near_api_js_1.transactions.functionCall(methodName, args, new bn_js_1.default(gas), new bn_js_1.default(deposit));
        }), near_api_js_1.utils.serialize.base_decode(block.header.hash));
        const [, signedTx] = await near_api_js_1.transactions.signTransaction(tx, signer, transactions[i].signerId, (0, constant_1.getConfig)().networkId);
        signedTransactions.push(signedTx);
    }
    return signedTransactions;
};
exports.getSignedTransactionsByMemoryKey = getSignedTransactionsByMemoryKey;
const sendTransactionsByMemoryKey = async ({ signedTransactions, }) => {
    try {
        const results = [];
        for (let i = 0; i < signedTransactions.length; i += 1) {
            results.push(await exports.provider.sendTransaction(signedTransactions[i]));
        }
        return results;
    }
    catch (err) {
        throw err;
    }
};
exports.sendTransactionsByMemoryKey = sendTransactionsByMemoryKey;
//# sourceMappingURL=near.js.map