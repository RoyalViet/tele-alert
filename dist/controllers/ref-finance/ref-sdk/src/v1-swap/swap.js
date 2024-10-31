"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.estimateSwap = exports.getPoolEstimate = exports.getPoolsByTokens = exports.getStablePoolsThisPair = exports.singlePoolSwap = exports.getStablePoolEstimate = exports.getSimplePoolEstimate = exports.PoolMode = void 0;
exports.getHybridStableSmart = getHybridStableSmart;
const utils_1 = require("../utils");
const big_js_1 = __importDefault(require("big.js"));
const error_1 = require("../error");
const utils_2 = require("../utils");
const lodash_1 = __importDefault(require("lodash"));
const constant_1 = require("../constant");
const stable_swap_1 = require("../stable-swap");
const ref_1 = require("../ref");
const utils_3 = require("../utils");
const indexer_1 = require("../indexer");
const utils_4 = require("../utils");
const smartRoutingLogic_js_1 = require("./smartRoutingLogic.js");
var PoolMode;
(function (PoolMode) {
    PoolMode["PARALLEL"] = "parallel swap";
    PoolMode["SMART"] = "smart routing";
    PoolMode["SMART_V2"] = "stableSmart";
    PoolMode["STABLE"] = "stable swap";
})(PoolMode || (exports.PoolMode = PoolMode = {}));
const getSimplePoolEstimate = ({ tokenIn, tokenOut, pool, amountIn, }) => {
    const amount_with_fee = Number(amountIn) * (constant_1.FEE_DIVISOR - pool.fee);
    const in_balance = (0, utils_1.toReadableNumber)(tokenIn.decimals, pool.supplies[tokenIn.id]);
    const out_balance = (0, utils_1.toReadableNumber)(tokenOut.decimals, pool.supplies[tokenOut.id]);
    const estimate = new big_js_1.default(((amount_with_fee * Number(out_balance)) /
        (constant_1.FEE_DIVISOR * Number(in_balance) + amount_with_fee)).toString()).toFixed();
    return {
        estimate,
        pool,
        outputToken: tokenOut.id,
        inputToken: tokenIn.id,
    };
};
exports.getSimplePoolEstimate = getSimplePoolEstimate;
const getStablePoolEstimate = ({ tokenIn, tokenOut, amountIn, stablePool, pool, }) => {
    const STABLE_LP_TOKEN_DECIMALS = (0, utils_4.getStablePoolDecimal)(stablePool);
    const [amount_swapped, _, dy] = (0, stable_swap_1.getSwappedAmount)(tokenIn.id, tokenOut.id, amountIn, stablePool, STABLE_LP_TOKEN_DECIMALS);
    const amountOut = amount_swapped < 0 || isNaN(amount_swapped)
        ? "0"
        : (0, utils_2.toPrecision)((0, utils_1.scientificNotationToString)(amount_swapped.toString()), 0);
    const dyOut = amount_swapped < 0 || isNaN(amount_swapped) || isNaN(dy)
        ? "0"
        : (0, utils_2.toPrecision)((0, utils_1.scientificNotationToString)(dy.toString()), 0);
    const rates = stablePool.rates.reduce((acc, cur, i) => {
        return {
            ...acc,
            [stablePool.token_account_ids[i]]: cur,
        };
    }, {});
    return {
        estimate: (0, utils_1.toReadableNumber)(STABLE_LP_TOKEN_DECIMALS, amountOut),
        noFeeAmountOut: (0, utils_1.toReadableNumber)(STABLE_LP_TOKEN_DECIMALS, dyOut),
        pool: {
            ...stablePool,
            rates,
        },
        outputToken: tokenOut.id,
        inputToken: tokenIn.id,
    };
};
exports.getStablePoolEstimate = getStablePoolEstimate;
/**
 * @description Get the estimate of the amount of tokenOut that can be received
 *
 */
const singlePoolSwap = ({ tokenIn, tokenOut, simplePools, amountIn, stablePools, }) => {
    if (!simplePools || simplePools.length === 0) {
        throw error_1.NoPoolError;
    }
    const parsedAmountIn = (0, utils_1.toNonDivisibleNumber)(tokenIn.decimals, amountIn);
    // const pools = simplePools.concat(stablePools);
    const simplePoolsThisPair = simplePools.filter((p) => p.tokenIds.includes(tokenIn.id) &&
        p.tokenIds.includes(tokenOut.id) &&
        (!stablePools || !(0, utils_3.isStablePool)(stablePools, p.id)));
    const estimatesSimplePool = simplePoolsThisPair.map((pool) => (0, exports.getSimplePoolEstimate)({
        tokenIn,
        tokenOut,
        pool,
        amountIn,
    }));
    const stablePoolThisPair = stablePools?.filter((sp) => sp.token_account_ids.includes(tokenIn.id) &&
        sp.token_account_ids.includes(tokenOut.id));
    // different stable lp token decimal for different type of pools
    const estimatesStablePool = stablePoolThisPair?.map((stablePool) => {
        return (0, exports.getStablePoolEstimate)({
            tokenIn,
            tokenOut,
            amountIn,
            stablePool,
            pool: simplePools.find((p) => p.id === stablePool.id),
        });
    });
    const maxSimplePoolEstimate = estimatesSimplePool === undefined || estimatesSimplePool.length === 0
        ? undefined
        : estimatesSimplePool.length === 1
            ? estimatesSimplePool[0]
            : lodash_1.default.maxBy(estimatesSimplePool, (estimate) => Number(estimate.estimate));
    const maxStablePoolEstimate = estimatesStablePool === undefined || estimatesStablePool.length === 0
        ? undefined
        : estimatesStablePool.length === 1
            ? estimatesStablePool[0]
            : lodash_1.default.maxBy(estimatesStablePool, (estimate) => Number(estimate.estimate));
    if (!maxStablePoolEstimate && !maxSimplePoolEstimate)
        throw error_1.NoPoolError;
    maxSimplePoolEstimate &&
        (maxSimplePoolEstimate.pool.partialAmountIn = parsedAmountIn);
    maxStablePoolEstimate &&
        (maxStablePoolEstimate.pool.partialAmountIn = parsedAmountIn);
    if (!maxStablePoolEstimate) {
        maxSimplePoolEstimate &&
            (maxSimplePoolEstimate.pool.partialAmountIn = parsedAmountIn);
        return maxSimplePoolEstimate;
    }
    else if (!maxSimplePoolEstimate) {
        return maxStablePoolEstimate;
    }
    else {
        return Number(maxSimplePoolEstimate?.estimate) >
            Number(maxStablePoolEstimate?.estimate)
            ? maxSimplePoolEstimate
            : maxStablePoolEstimate;
    }
};
exports.singlePoolSwap = singlePoolSwap;
const getStablePoolsThisPair = ({ tokenInId, tokenOutId, stablePools, }) => {
    return stablePools.filter((p) => p.tokenIds.includes(tokenInId) &&
        p.tokenIds.includes(tokenOutId) &&
        tokenInId !== tokenOutId);
};
exports.getStablePoolsThisPair = getStablePoolsThisPair;
const getPoolsByTokens = ({ pools, tokenInId, tokenOutId, }) => {
    if (tokenInId === tokenOutId)
        return [];
    return pools.filter((p) => p.tokenIds.includes(tokenInId) && p.tokenIds.includes(tokenOutId));
};
exports.getPoolsByTokens = getPoolsByTokens;
const getPoolEstimate = async ({ tokenIn, tokenOut, amountIn, stablePoolDetail, pool, }) => {
    if (!!stablePoolDetail) {
        return (0, exports.getStablePoolEstimate)({
            tokenIn,
            tokenOut,
            stablePool: stablePoolDetail,
            amountIn,
            pool,
        });
    }
    else {
        return (0, exports.getSimplePoolEstimate)({
            tokenIn,
            tokenOut,
            pool,
            amountIn,
        });
    }
};
exports.getPoolEstimate = getPoolEstimate;
async function getHybridStableSmart(tokenIn, tokenOut, amountIn, stablePools, stablePoolsDetail, simplePools, allTokens) {
    if (!(0, utils_4.isStablePoolToken)(stablePoolsDetail, tokenIn.id) &&
        !(0, utils_4.isStablePoolToken)(stablePoolsDetail, tokenOut.id)) {
        return { actions: [], estimate: "0" };
    }
    const stablePoolsDetailById = stablePoolsDetail.reduce((acc, cur) => {
        return {
            ...acc,
            [cur.id]: cur,
        };
    }, {});
    const parsedAmountIn = (0, utils_1.toNonDivisibleNumber)(tokenIn.decimals, amountIn);
    let pool1, pool2;
    let pools1 = [];
    let pools2 = [];
    let pools1Right = [];
    let pools2Right = [];
    let candidatePools = [];
    /**
     * find possible routes for this pair
     *
     *
     */
    if ((0, utils_4.isStablePoolToken)(stablePoolsDetail, tokenIn.id)) {
        // first hop will be through stable pool.
        pools1 = stablePools.filter((pool) => pool.tokenIds.includes(tokenIn.id));
        const otherStables = pools1
            .map((pool) => pool.tokenIds.filter((id) => id !== tokenIn.id))
            .flat();
        for (var otherStable of otherStables) {
            let stablePoolsThisPair = (0, exports.getStablePoolsThisPair)({
                tokenInId: otherStable,
                tokenOutId: tokenOut.id,
                stablePools,
            });
            let tmpPools = (0, exports.getPoolsByTokens)({
                tokenInId: otherStable,
                tokenOutId: tokenOut.id,
                pools: simplePools,
            });
            const tobeAddedPools = tmpPools.concat(stablePoolsThisPair);
            pools2.push(...tobeAddedPools.filter((p) => {
                const supplies = Object.values(p.supplies);
                return new big_js_1.default(supplies[0]).times(new big_js_1.default(supplies[1])).gt(0);
            }));
        }
    }
    if ((0, utils_4.isStablePoolToken)(stablePoolsDetail, tokenOut.id)) {
        // second hop will be through stable pool.
        pools2Right = stablePools.filter((pool) => pool.tokenIds.includes(tokenOut.id));
        const otherStables = pools2Right
            .map((pool) => pool.tokenIds.filter((id) => id !== tokenOut.id))
            .flat();
        for (let otherStable of otherStables) {
            let stablePoolsThisPair = (0, exports.getStablePoolsThisPair)({
                tokenInId: tokenIn.id,
                tokenOutId: otherStable,
                stablePools,
            });
            let tmpPools = (0, exports.getPoolsByTokens)({
                tokenInId: tokenIn.id,
                tokenOutId: otherStable,
                pools: simplePools,
            });
            const tobeAddedPools = tmpPools.concat(stablePoolsThisPair);
            pools1Right.push(...tobeAddedPools.filter((p) => {
                const supplies = Object.values(p.supplies);
                return new big_js_1.default(supplies[0]).times(new big_js_1.default(supplies[1])).gt(0);
            }));
        }
    }
    // find candidate pools
    for (let p1 of pools1) {
        let middleTokens = p1.tokenIds.filter((id) => id !== tokenIn.id);
        for (let middleToken of middleTokens) {
            let p2s = pools2.filter((p) => p.tokenIds.includes(middleToken) &&
                p.tokenIds.includes(tokenOut.id) &&
                middleToken !== tokenOut.id);
            let p2 = lodash_1.default.maxBy(p2s, (p) => Number(new big_js_1.default((0, utils_1.toReadableNumber)(tokenOut.decimals, p.supplies[tokenOut.id]))));
            if (middleToken === tokenOut.id) {
                p2 = p1;
            }
            if (p1 && p2) {
                if (p1.id === p2.id)
                    candidatePools.push([p1]);
                else
                    candidatePools.push([p1, p2]);
            }
        }
    }
    for (let p1 of pools1Right) {
        let middleTokens = p1.tokenIds.filter((id) => id !== tokenIn.id);
        for (let middleToken of middleTokens) {
            let p2s = pools2Right.filter((p) => p.tokenIds.includes(middleToken) &&
                p.tokenIds.includes(tokenOut.id) &&
                middleToken !== tokenOut.id);
            let p2 = lodash_1.default.maxBy(p2s, (p) => Number(new big_js_1.default((0, utils_1.toReadableNumber)(tokenOut.decimals, p.supplies[tokenOut.id]))));
            if (middleToken === tokenOut.id) {
                p2 = p1;
            }
            if (p1 && p2) {
                if (p1.id === p2.id)
                    candidatePools.push([p1]);
                else
                    candidatePools.push([p1, p2]);
            }
        }
    }
    if (candidatePools.length > 0) {
        const tokensMedata = await (0, ref_1.ftGetTokensMetadata)(candidatePools.map((cp) => cp.map((p) => p.tokenIds).flat()).flat(), allTokens);
        const BestPoolPair = candidatePools.length === 1
            ? candidatePools[0]
            : lodash_1.default.maxBy(candidatePools, (poolPair) => {
                // only one pool case, only for stable tokens
                if (poolPair.length === 1) {
                    if ((0, utils_3.isStablePool)(stablePoolsDetail, poolPair[0].id)) {
                        const stablePoolThisPair = (0, exports.getStablePoolsThisPair)({
                            tokenInId: tokenIn.id,
                            tokenOutId: tokenOut.id,
                            stablePools,
                        })[0];
                        const stablePoolDetailThisPair = stablePoolsDetail.find((spd) => spd.id === stablePoolThisPair.id);
                        return Number((0, exports.getStablePoolEstimate)({
                            tokenIn,
                            tokenOut,
                            stablePool: stablePoolDetailThisPair,
                            amountIn,
                            pool: poolPair[0],
                        }).estimate);
                    }
                    else {
                        return Number((0, exports.getSimplePoolEstimate)({
                            tokenIn,
                            tokenOut,
                            amountIn,
                            pool: poolPair[0],
                        }).estimate);
                    }
                }
                const [tmpPool1, tmpPool2] = poolPair;
                const tokenMidId = poolPair[0].tokenIds.find((t) => poolPair[1].tokenIds.includes(t));
                const tokenMidMeta = tokensMedata[tokenMidId];
                const estimate1 = {
                    ...((0, utils_3.isStablePool)(stablePoolsDetail, tmpPool1.id)
                        ? (0, exports.getStablePoolEstimate)({
                            tokenIn,
                            tokenOut: tokenMidMeta,
                            amountIn,
                            stablePool: stablePoolsDetailById[tmpPool1.id],
                            pool: tmpPool1,
                        })
                        : (0, exports.getSimplePoolEstimate)({
                            tokenIn,
                            tokenOut: tokenMidMeta,
                            amountIn,
                            pool: tmpPool1,
                        })),
                    status: PoolMode.SMART,
                };
                const estimate2 = {
                    ...((0, utils_3.isStablePool)(stablePoolsDetail, tmpPool2.id)
                        ? (0, exports.getStablePoolEstimate)({
                            tokenIn: tokenMidMeta,
                            tokenOut,
                            amountIn: estimate1.estimate,
                            stablePool: stablePoolsDetailById[tmpPool2.id],
                            pool: tmpPool2,
                        })
                        : (0, exports.getSimplePoolEstimate)({
                            tokenIn: tokenMidMeta,
                            tokenOut,
                            pool: tmpPool2,
                            amountIn: estimate1.estimate,
                        })),
                    status: PoolMode.SMART,
                };
                return Number(estimate2.estimate);
            });
        // one pool case only get best price
        if (!BestPoolPair)
            return { actions: [], estimate: "0" };
        if (BestPoolPair.length === 1) {
            const bestPool = BestPoolPair[0];
            const estimate = await (0, exports.getPoolEstimate)({
                tokenIn,
                tokenOut,
                amountIn,
                pool: bestPool,
                stablePoolDetail: stablePoolsDetailById[bestPool.id],
            });
            return {
                actions: [
                    {
                        ...estimate,
                        status: PoolMode.STABLE,
                        pool: { ...estimate.pool, partialAmountIn: parsedAmountIn },
                        tokens: [tokenIn, tokenOut],
                        inputToken: tokenIn.id,
                        outputToken: tokenOut.id,
                        totalInputAmount: (0, utils_1.toNonDivisibleNumber)(tokenIn.decimals, amountIn),
                    },
                ],
                estimate: estimate.estimate,
            };
        }
        // two pool case get best price
        [pool1, pool2] = BestPoolPair;
        const tokenMidId = BestPoolPair[0].tokenIds.find((t) => BestPoolPair[1].tokenIds.includes(t));
        const tokenMidMeta = allTokens[tokenMidId] ||
            (await (0, ref_1.ftGetTokenMetadata)(tokenMidId, "hybridSmartRoutingEstimate"));
        const estimate1 = {
            ...((0, utils_3.isStablePool)(stablePoolsDetail, pool1.id)
                ? (0, exports.getStablePoolEstimate)({
                    tokenIn,
                    tokenOut: tokenMidMeta,
                    amountIn,
                    stablePool: stablePoolsDetailById[pool1.id],
                    pool: pool1,
                })
                : (0, exports.getSimplePoolEstimate)({
                    tokenIn,
                    tokenOut: tokenMidMeta,
                    amountIn,
                    pool: pool1,
                })),
            tokens: [tokenIn, tokenMidMeta, tokenOut],
            inputToken: tokenIn.id,
            outputToken: tokenMidMeta.id,
            status: PoolMode.SMART,
        };
        estimate1.pool = {
            ...estimate1.pool,
            partialAmountIn: parsedAmountIn,
        };
        const estimate2 = {
            ...((0, utils_3.isStablePool)(stablePoolsDetail, pool2.id)
                ? (0, exports.getStablePoolEstimate)({
                    tokenIn: tokenMidMeta,
                    tokenOut,
                    amountIn: estimate1.estimate,
                    stablePool: stablePoolsDetailById[pool2.id],
                    pool: pool2,
                })
                : (0, exports.getSimplePoolEstimate)({
                    tokenIn: tokenMidMeta,
                    tokenOut,
                    amountIn: estimate1.estimate,
                    pool: pool2,
                })),
            tokens: [tokenIn, tokenMidMeta, tokenOut],
            inputToken: tokenMidMeta.id,
            outputToken: tokenOut.id,
            status: PoolMode.SMART,
        };
        return { actions: [estimate1, estimate2], estimate: estimate2.estimate };
    }
    return { actions: [], estimate: "0" };
}
// simple pools and stable pools for this pair
const estimateSwap = async ({ tokenIn, tokenOut, amountIn, simplePools, options, }) => {
    if (tokenIn.id === tokenOut.id)
        throw error_1.SameInputTokenError;
    if (utils_2.ONLY_ZEROS.test(amountIn))
        throw error_1.ZeroInputError;
    const { enableSmartRouting, stablePools, stablePoolsDetail } = options || {};
    const parsedAmountIn = (0, utils_1.toNonDivisibleNumber)(tokenIn.decimals, amountIn);
    let singleRouteEstimate = [];
    try {
        const estimate = (0, exports.singlePoolSwap)({
            tokenIn,
            tokenOut,
            simplePools,
            amountIn,
            stablePools: stablePoolsDetail,
        });
        singleRouteEstimate = [
            {
                ...estimate,
                status: PoolMode.PARALLEL,
                pool: { ...estimate?.pool, partialAmountIn: parsedAmountIn },
                totalInputAmount: (0, utils_1.toNonDivisibleNumber)(tokenIn.decimals, amountIn),
                tokens: [tokenIn, tokenOut],
            },
        ];
        if (!enableSmartRouting) {
            return singleRouteEstimate;
        }
    }
    catch (error) {
        if (!enableSmartRouting)
            throw error;
    }
    const inputPools = simplePools.map((p) => (0, utils_4.poolFormatter)(p));
    const allTokens = (await (0, indexer_1.getTokensTiny)());
    const simplePoolSmartRoutingActions = await (0, smartRoutingLogic_js_1.stableSmart)(inputPools, tokenIn.id, tokenOut.id, parsedAmountIn, allTokens);
    const simplePoolSmartRoutingEstimate = (0, smartRoutingLogic_js_1.getExpectedOutputFromActionsORIG)(simplePoolSmartRoutingActions, tokenOut.id).toString();
    const hybridSmartRoutingRes = await getHybridStableSmart(tokenIn, tokenOut, amountIn, stablePools || [], stablePoolsDetail || [], simplePools, allTokens);
    const hybridSmartRoutingEstimate = hybridSmartRoutingRes.estimate.toString();
    if (new big_js_1.default(simplePoolSmartRoutingEstimate || "0").gte(hybridSmartRoutingEstimate || "0")) {
        if (!simplePoolSmartRoutingActions?.length)
            throw error_1.NoPoolError;
        if (typeof singleRouteEstimate !== "undefined" &&
            singleRouteEstimate &&
            singleRouteEstimate?.[0]?.estimate &&
            new big_js_1.default(singleRouteEstimate[0].estimate || "0").gt(simplePoolSmartRoutingEstimate || "0")) {
            return singleRouteEstimate;
        }
        return simplePoolSmartRoutingActions;
    }
    else {
        if (typeof singleRouteEstimate !== "undefined" &&
            singleRouteEstimate &&
            singleRouteEstimate?.[0]?.estimate &&
            new big_js_1.default(singleRouteEstimate[0].estimate || "0").gt(hybridSmartRoutingEstimate || "0")) {
            return singleRouteEstimate;
        }
        return hybridSmartRoutingRes.actions;
    }
};
exports.estimateSwap = estimateSwap;
//# sourceMappingURL=swap.js.map