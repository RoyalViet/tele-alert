"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWhiteListTokensIndexer = exports.getTokensTiny = exports.getTokens = exports.getTokenPriceList = exports.REF_WIDGET_ALL_LIGHT_TOKENS_LIST_KEY = exports.REF_WIDGET_ALL_TOKENS_LIST_KEY = void 0;
const constant_1 = require("./constant");
const ref_1 = require("./ref");
const metaIcons_1 = __importDefault(require("./metaIcons"));
exports.REF_WIDGET_ALL_TOKENS_LIST_KEY = "REF_WIDGET_ALL_TOKENS_LIST_VALUE";
exports.REF_WIDGET_ALL_LIGHT_TOKENS_LIST_KEY = "REF_WIDGET_ALL_LIGHT_TOKENS_LIST_VALUE";
const getTokenPriceList = async () => {
    return await fetch(constant_1.config.indexerUrl + "/list-token-price", {
        method: "GET",
        headers: { "Content-type": "application/json; charset=UTF-8" },
    })
        .then((res) => res.json())
        .then((list) => {
        return list;
    });
};
exports.getTokenPriceList = getTokenPriceList;
const getTokens = async (reload) => {
    const storagedTokens = typeof window !== "undefined" && !reload
        ? localStorage.getItem(exports.REF_WIDGET_ALL_TOKENS_LIST_KEY)
        : null;
    return storagedTokens
        ? JSON.parse(storagedTokens)
        : await fetch(constant_1.config.indexerUrl + "/list-token", {
            method: "GET",
            headers: { "Content-type": "application/json; charset=UTF-8" },
        })
            .then((res) => res.json())
            .then((tokens) => {
            const newTokens = Object.values(tokens).reduce((acc, cur, i) => {
                const id = Object.keys(tokens)[i];
                return {
                    ...acc,
                    [id]: {
                        ...cur,
                        id,
                        icon: !cur.icon || ref_1.REPLACE_TOKENS.includes(id)
                            ? metaIcons_1.default[id]
                            : cur.icon,
                    },
                };
            }, {});
            return newTokens;
        })
            .then((res) => {
            typeof window !== "undefined" &&
                !reload &&
                localStorage.setItem(exports.REF_WIDGET_ALL_TOKENS_LIST_KEY, JSON.stringify(res));
            return res;
        });
};
exports.getTokens = getTokens;
const getTokensTiny = async (reload) => {
    const storagedTokens = typeof window !== "undefined" && !reload
        ? localStorage.getItem(exports.REF_WIDGET_ALL_LIGHT_TOKENS_LIST_KEY)
        : null;
    return storagedTokens
        ? JSON.parse(storagedTokens)
        : await fetch(constant_1.config.indexerUrl + "/list-token-v2", {
            method: "GET",
            headers: { "Content-type": "application/json; charset=UTF-8" },
        })
            .then((res) => res.json())
            .then((tokens) => {
            const newTokens = Object.values(tokens).reduce((acc, cur, i) => {
                const id = Object.keys(tokens)[i];
                return {
                    ...acc,
                    [id]: {
                        ...cur,
                        id,
                    },
                };
            }, {});
            return newTokens;
        })
            .then((res) => {
            typeof window !== "undefined" &&
                !reload &&
                localStorage.setItem(exports.REF_WIDGET_ALL_LIGHT_TOKENS_LIST_KEY, JSON.stringify(res));
            return res;
        });
};
exports.getTokensTiny = getTokensTiny;
const getWhiteListTokensIndexer = async (whiteListIds) => {
    return await fetch(constant_1.config.indexerUrl + "/list-token", {
        method: "GET",
        headers: { "Content-type": "application/json; charset=UTF-8" },
    })
        .then((res) => res.json())
        .then((res) => {
        return whiteListIds.reduce((acc, cur, i) => {
            if (!res[cur] ||
                !Object.values(res[cur]) ||
                Object.values(res[cur]).length === 0)
                return acc;
            return {
                ...acc,
                [cur]: { ...res[cur], id: cur },
            };
        }, {});
    })
        .then((res) => {
        return Object.values(res);
    });
};
exports.getWhiteListTokensIndexer = getWhiteListTokensIndexer;
//# sourceMappingURL=indexer.js.map