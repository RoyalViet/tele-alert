"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAllPools = exports.getRefPools = exports.getPoolByIds = exports.getPool = exports.getStablePools = exports.getUnRatedPoolDetail = exports.getRatedPoolDetail = void 0;
const constant_1 = require("../constant");
const ref_1 = require("../ref");
const utils_1 = require("../utils");
let DEFAULT_PAGE_LIMIT = 100;
const BLACK_TOKEN_LIST = ["meta-token.near"];
const getRatedPoolDetail = async ({ id }) => {
    return (0, ref_1.refFiViewFunction)({
        methodName: "get_rated_pool",
        args: { pool_id: Number(id) },
    }).then((pool_info) => ({
        ...pool_info,
        id: Number(id),
        pool_kind: "RATED_SWAP",
    }));
};
exports.getRatedPoolDetail = getRatedPoolDetail;
const getUnRatedPoolDetail = async ({ id }) => {
    return (0, ref_1.refFiViewFunction)({
        methodName: "get_stable_pool",
        args: { pool_id: Number(id) },
    }).then((pool_info) => ({
        ...pool_info,
        id: Number(id),
        pool_kind: "STABLE_SWAP",
        rates: pool_info.c_amounts.map((_) => (0, utils_1.toNonDivisibleNumber)(constant_1.STABLE_LP_TOKEN_DECIMALS, "1")),
    }));
};
exports.getUnRatedPoolDetail = getUnRatedPoolDetail;
const getStablePools = async (stablePools) => {
    return Promise.all(stablePools.map((pool) => pool.pool_kind === "RATED_SWAP"
        ? (0, exports.getRatedPoolDetail)({ id: pool.id })
        : (0, exports.getUnRatedPoolDetail)({ id: pool.id })));
};
exports.getStablePools = getStablePools;
const getPool = async (id) => {
    return await (0, ref_1.refFiViewFunction)({
        methodName: "get_pool",
        args: { pool_id: id },
    }).then((pool) => (0, utils_1.parsePool)(pool, id));
};
exports.getPool = getPool;
const getPoolByIds = async (ids) => {
    return await (0, ref_1.refFiViewFunction)({
        methodName: "get_pool_by_ids",
        args: { pool_ids: ids },
    }).then((pools) => pools.map((p, i) => (0, utils_1.parsePool)(p, ids[i])));
};
exports.getPoolByIds = getPoolByIds;
const getRefPools = async (page = 1, perPage = DEFAULT_PAGE_LIMIT) => {
    const index = (page - 1) * perPage;
    const poolData = await (0, ref_1.refFiViewFunction)({
        methodName: "get_pools",
        args: { from_index: index, limit: perPage },
    });
    return poolData
        .map((rawPool, i) => (0, utils_1.parsePool)(rawPool, i + index))
        .filter((p) => !p.tokenIds?.find((tokenId) => BLACK_TOKEN_LIST.includes(tokenId)));
};
exports.getRefPools = getRefPools;
const fetchAllPools = async (perPage) => {
    try {
        const pools = await fetch(`${constant_1.config.indexerUrl}/fetchAllPools`).then((res) => res.json());
        if (pools.code !== 0 || !pools.simplePools)
            throw Error();
        return pools;
    }
    catch (error) { }
    if (perPage) {
        DEFAULT_PAGE_LIMIT = Math.min(perPage, 500);
    }
    const totalPools = await (0, ref_1.getTotalPools)();
    const pages = Math.ceil(totalPools / DEFAULT_PAGE_LIMIT);
    const pools = (await Promise.all([...Array(pages)].fill(0).map((_, i) => (0, exports.getRefPools)(i + 1)))).flat();
    return {
        simplePools: pools.filter((p) => p.pool_kind && p.pool_kind === "SIMPLE_POOL"),
        unRatedPools: pools.filter((p) => p.pool_kind && p.pool_kind === "STABLE_SWAP"),
        ratedPools: pools.filter((p) => p.pool_kind && p.pool_kind === "RATED_SWAP"),
    };
};
exports.fetchAllPools = fetchAllPools;
//# sourceMappingURL=pool.js.map