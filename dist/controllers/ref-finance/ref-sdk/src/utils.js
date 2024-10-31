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
exports.registerAccountOnToken = exports.pointToPrice = exports.feeToPointDelta = exports.getMax = exports.isMobile = exports.subtraction = exports.getPriceImpact = exports.calculatePriceImpact = exports.calcStableSwapPriceImpact = exports.percent = exports.calculateSmartRoutingPriceImpact = exports.calculateMarketPrice = exports.calculateAmountReceived = exports.calculateFeePercent = exports.calculateFeeCharge = exports.toRealSymbol = exports.percentOfBigNumber = exports.toInternationalCurrencySystemLongString = exports.multiply = exports.symbolsArr = exports.getAccountName = exports.getAvgFee = exports.calculateExchangeRate = exports.separateRoutes = exports.WalletSelectorTransactions = exports.transformTransactions = exports.toPrecision = exports.formatWithCommas = exports.scientificNotationToString = exports.toNonDivisibleNumber = exports.toReadableNumber = exports.ONLY_ZEROS = exports.getAmount = exports.getGas = exports.percentLess = exports.percentOf = exports.convertToPercentDecimal = exports.round = exports.getStablePoolDecimal = exports.isStablePool = exports.isStablePoolToken = exports.poolFormatter = exports.parsePool = void 0;
exports.getExpectedOutputFromSwapTodos = getExpectedOutputFromSwapTodos;
exports.calculateSmartRoutesV2PriceImpact = calculateSmartRoutesV2PriceImpact;
exports.getPoolAllocationPercents = getPoolAllocationPercents;
exports.divide = divide;
exports.getPointByPrice = getPointByPrice;
const constant_1 = require("./constant");
const near_api_js_1 = require("near-api-js");
const lodash_1 = require("lodash");
const bn_js_1 = __importDefault(require("bn.js"));
const math = __importStar(require("mathjs"));
const constant_2 = require("./constant");
const big_js_1 = __importDefault(require("big.js"));
const swap_1 = require("./v1-swap/swap");
const stable_swap_1 = require("./stable-swap");
const error_1 = require("./error");
const constant_3 = require("./constant");
const parsePool = (pool, id) => ({
    id: Number(typeof id === "number" ? id : pool.id),
    tokenIds: pool.token_account_ids,
    supplies: pool.amounts.reduce((acc, amount, i) => {
        acc[pool.token_account_ids[i]] = amount;
        return acc;
    }, {}),
    fee: pool.total_fee,
    shareSupply: pool.shares_total_supply,
    tvl: pool.tvl,
    token0_ref_price: pool.token0_ref_price,
    pool_kind: pool.pool_kind,
});
exports.parsePool = parsePool;
const poolFormatter = (pool) => {
    return {
        id: pool.id,
        token1Id: pool.tokenIds[0],
        token2Id: pool.tokenIds[1],
        token1Supply: pool.supplies[pool.tokenIds[0]],
        token2Supply: pool.supplies[pool.tokenIds[1]],
        fee: pool.fee,
        shares: pool.shareSupply,
        token0_price: pool.token0_ref_price || "0",
    };
};
exports.poolFormatter = poolFormatter;
const isStablePoolToken = (stablePools, tokenId) => {
    return stablePools
        .map((p) => p.token_account_ids)
        .flat()
        .includes(tokenId.toString());
};
exports.isStablePoolToken = isStablePoolToken;
const isStablePool = (stablePools, poolId) => {
    return stablePools.map((p) => p.id.toString()).includes(poolId.toString());
};
exports.isStablePool = isStablePool;
const getStablePoolDecimal = (stablePool) => {
    return stablePool.pool_kind === "RATED_SWAP"
        ? constant_1.RATED_POOL_LP_TOKEN_DECIMALS
        : constant_1.STABLE_LP_TOKEN_DECIMALS;
};
exports.getStablePoolDecimal = getStablePoolDecimal;
const round = (decimals, minAmountOut) => {
    return Number.isInteger(Number(minAmountOut))
        ? minAmountOut
        : Math.ceil(Math.round(Number(minAmountOut) * Math.pow(10, decimals)) /
            Math.pow(10, decimals)).toString();
};
exports.round = round;
const convertToPercentDecimal = (percent) => {
    return math.divide(percent, 100);
};
exports.convertToPercentDecimal = convertToPercentDecimal;
const percentOf = (percent, num) => {
    return math.evaluate(`${(0, exports.convertToPercentDecimal)(percent)} * ${num}`);
};
exports.percentOf = percentOf;
const percentLess = (percent, num) => {
    return math.format(math.evaluate(`${num} - ${(0, exports.percentOf)(percent, num)}`), {
        notation: "fixed",
    });
};
exports.percentLess = percentLess;
const getGas = (gas) => gas ? new bn_js_1.default(gas) : new bn_js_1.default("100000000000000");
exports.getGas = getGas;
const getAmount = (amount) => amount ? new bn_js_1.default(near_api_js_1.utils.format.parseNearAmount(amount) || "0") : new bn_js_1.default("0");
exports.getAmount = getAmount;
exports.ONLY_ZEROS = /^0*\.?0*$/;
const toReadableNumber = (decimals, number = "0") => {
    if (!decimals)
        return number;
    const wholeStr = number.substring(0, number.length - decimals) || "0";
    const fractionStr = number
        .substring(number.length - decimals)
        .padStart(decimals, "0")
        .substring(0, decimals);
    return `${wholeStr}.${fractionStr}`.replace(/\.?0+$/, "");
};
exports.toReadableNumber = toReadableNumber;
const toNonDivisibleNumber = (decimals, number) => {
    if (decimals === null || decimals === undefined)
        return number;
    const [wholePart, fracPart = ""] = number.split(".");
    return `${wholePart}${fracPart.padEnd(decimals, "0").slice(0, decimals)}`
        .replace(/^0+/, "")
        .padStart(1, "0");
};
exports.toNonDivisibleNumber = toNonDivisibleNumber;
const scientificNotationToString = (strParam) => {
    let flag = /e/.test(strParam);
    if (!flag || !strParam)
        return strParam;
    let sysbol = true;
    if (/e-/.test(strParam)) {
        sysbol = false;
    }
    const negative = Number(strParam) < 0 ? "-" : "";
    let index = Number(strParam.match(/\d+$/)?.[0]);
    let basis = strParam.match(/[\d\.]+/)?.[0];
    if (!index || !basis)
        return strParam;
    const ifFraction = basis.includes(".");
    let wholeStr;
    let fractionStr;
    if (ifFraction) {
        wholeStr = basis.split(".")[0];
        fractionStr = basis.split(".")[1];
    }
    else {
        wholeStr = basis;
        fractionStr = "";
    }
    if (sysbol) {
        if (!ifFraction) {
            return negative + wholeStr.padEnd(index + wholeStr.length, "0");
        }
        else {
            if (fractionStr.length <= index) {
                return negative + wholeStr + fractionStr.padEnd(index, "0");
            }
            else {
                return (negative +
                    wholeStr +
                    fractionStr.substring(0, index) +
                    "." +
                    fractionStr.substring(index));
            }
        }
    }
    else {
        if (!ifFraction)
            return (negative +
                wholeStr.padStart(index + wholeStr.length, "0").replace(/^0/, "0."));
        else {
            return (negative +
                wholeStr.padStart(index + wholeStr.length, "0").replace(/^0/, "0.") +
                fractionStr);
        }
    }
};
exports.scientificNotationToString = scientificNotationToString;
const formatWithCommas = (value) => {
    const pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(value)) {
        value = value.replace(pattern, "$1,$2");
    }
    return value;
};
exports.formatWithCommas = formatWithCommas;
const toPrecision = (number, precision, withCommas = false, atLeastOne = true) => {
    const [whole, decimal = ""] = number.split(".");
    let str = `${withCommas ? (0, exports.formatWithCommas)(whole) : whole}.${decimal.slice(0, precision)}`.replace(/\.$/, "");
    if (atLeastOne && Number(str) === 0 && str.length > 1) {
        var n = str.lastIndexOf("0");
        str = str.slice(0, n) + str.slice(n).replace("0", "1");
    }
    return str;
};
exports.toPrecision = toPrecision;
const transformTransactions = (transactions, AccountId) => {
    const parsedTransactions = transactions.map((t) => {
        return {
            signerId: AccountId,
            receiverId: t.receiverId,
            actions: t.functionCalls.map((fc) => {
                return {
                    type: "FunctionCall",
                    params: {
                        methodName: fc.methodName,
                        args: fc.args || {},
                        gas: (0, exports.getGas)(fc.gas).toNumber().toFixed(),
                        deposit: near_api_js_1.utils.format.parseNearAmount(fc.amount || "0"),
                    },
                };
            }),
        };
    });
    return parsedTransactions;
};
exports.transformTransactions = transformTransactions;
const WalletSelectorTransactions = (transactions, AccountId) => {
    const parsedTransactions = transactions.map((t) => {
        return {
            signerId: AccountId,
            receiverId: t.receiverId,
            actions: t.functionCalls.map((fc) => {
                return {
                    type: "FunctionCall",
                    params: {
                        methodName: fc.methodName,
                        args: fc.args || {},
                        gas: (0, exports.getGas)(fc.gas).toNumber().toFixed(),
                        deposit: near_api_js_1.utils.format.parseNearAmount(fc.amount || "0"),
                    },
                };
            }),
        };
    });
    return { transactions: parsedTransactions };
};
exports.WalletSelectorTransactions = WalletSelectorTransactions;
const separateRoutes = (actions, outputToken) => {
    const res = [];
    let curRoute = [];
    for (let i in actions) {
        curRoute.push(actions[i]);
        if (actions[i].outputToken === outputToken) {
            res.push(curRoute);
            curRoute = [];
        }
    }
    return res;
};
exports.separateRoutes = separateRoutes;
const calculateExchangeRate = (from, to, precision) => {
    return math
        .floor(math.evaluate(`${to} / ${from}`), precision || 4)
        .toString();
};
exports.calculateExchangeRate = calculateExchangeRate;
const getAvgFee = (estimates, outputToken, parsedAmountIn) => {
    if (!estimates || estimates.length === 0) {
        return 0;
    }
    const routes = (0, exports.separateRoutes)(estimates, outputToken);
    let fee = new big_js_1.default(0);
    routes.forEach((r) => {
        const partialAmountIn = r[0].pool.partialAmountIn || "0";
        fee = fee.plus(r
            .reduce((acc, cur) => acc.plus(cur.pool.fee || cur.pool.total_fee || 0), new big_js_1.default(0))
            .times(partialAmountIn)
            .div(exports.ONLY_ZEROS.test(parsedAmountIn) ? "1" : parsedAmountIn));
    });
    return fee.toNumber();
};
exports.getAvgFee = getAvgFee;
const getAccountName = (AccountId) => {
    if (!AccountId)
        return AccountId;
    const [account, network] = AccountId.split(".");
    const niceAccountId = `${account.slice(0, 10)}...${network || ""}`;
    return account.length > 10 ? niceAccountId : AccountId;
};
exports.getAccountName = getAccountName;
exports.symbolsArr = ["e", "E", "+", "-"];
const multiply = (factor1, factor2) => {
    return math.format(math.evaluate(`${factor1} * ${factor2}`), {
        notation: "fixed",
    });
};
exports.multiply = multiply;
const toInternationalCurrencySystemLongString = (labelValue, percent) => {
    return Math.abs(Number(labelValue)) >= 1.0e9
        ? (Math.abs(Number(labelValue)) / 1.0e9).toFixed(percent || 2) + "B"
        : Math.abs(Number(labelValue)) >= 1.0e6
            ? (Math.abs(Number(labelValue)) / 1.0e6).toFixed(percent || 2) + "M"
            : Math.abs(Number(labelValue)).toFixed(percent || 2);
};
exports.toInternationalCurrencySystemLongString = toInternationalCurrencySystemLongString;
const percentOfBigNumber = (percent, num, precision) => {
    const valueBig = math.bignumber(num);
    const percentBig = math.bignumber(percent).div(100);
    return (0, exports.toPrecision)((0, exports.scientificNotationToString)(valueBig.mul(percentBig).toString()), precision);
};
exports.percentOfBigNumber = percentOfBigNumber;
const toRealSymbol = (symbol) => {
    if (!symbol)
        return "";
    const blackList = ["nUSDO"];
    if (symbol === "nWETH" || symbol === "WETH")
        return "wETH";
    if (blackList.includes(symbol))
        return symbol;
    return symbol.charAt(0) === "n" &&
        symbol.charAt(1) === symbol.charAt(1).toUpperCase()
        ? symbol.substring(1)
        : symbol;
};
exports.toRealSymbol = toRealSymbol;
const calculateFeeCharge = (fee, total) => {
    return math.floor(math.evaluate(`(${fee} / ${constant_1.FEE_DIVISOR}) * ${total}`), 3);
};
exports.calculateFeeCharge = calculateFeeCharge;
const calculateFeePercent = (fee) => {
    return math.divide(fee, 100);
};
exports.calculateFeePercent = calculateFeePercent;
function getExpectedOutputFromSwapTodos(estimates, outputToken) {
    if (!estimates || estimates.length === 0)
        return new big_js_1.default(0);
    return estimates
        .filter((item) => item.outputToken === outputToken)
        .map((item) => new big_js_1.default(item.estimate || 0))
        .reduce((a, b) => a.plus(b), new big_js_1.default(0));
}
const calculateAmountReceived = (pool, amountIn, tokenIn, tokenOut) => {
    const partialAmountIn = (0, exports.toReadableNumber)(tokenIn.decimals, amountIn);
    const in_balance = (0, exports.toReadableNumber)(tokenIn.decimals, pool.supplies[tokenIn.id]);
    const out_balance = (0, exports.toReadableNumber)(tokenOut.decimals, pool.supplies[tokenOut.id]);
    const big_in_balance = math.bignumber(in_balance);
    const big_out_balance = math.bignumber(out_balance);
    const constant_product = big_in_balance.mul(big_out_balance);
    const new_in_balance = big_in_balance.plus(math.bignumber(partialAmountIn));
    const new_out_balance = constant_product.div(new_in_balance);
    const tokenOutReceived = big_out_balance.minus(new_out_balance);
    return tokenOutReceived;
};
exports.calculateAmountReceived = calculateAmountReceived;
const calculateMarketPrice = (pool, tokenIn, tokenOut) => {
    const cur_in_balance = (0, exports.toReadableNumber)(tokenIn.decimals, pool.supplies[tokenIn.id]);
    const cur_out_balance = (0, exports.toReadableNumber)(tokenOut.decimals, pool.supplies[tokenOut.id]);
    return math.evaluate(`(${cur_in_balance} / ${cur_out_balance})`);
};
exports.calculateMarketPrice = calculateMarketPrice;
const calculateSmartRoutingPriceImpact = (tokenInAmount, swapTodos, tokenIn, tokenMid, tokenOut, stablePools) => {
    const isPool1StablePool = (0, exports.isStablePool)(stablePools, swapTodos[0].pool.id);
    const isPool2StablePool = (0, exports.isStablePool)(stablePools, swapTodos[1].pool.id);
    const marketPrice1 = isPool1StablePool
        ? (Number(swapTodos[0].pool.rates?.[tokenMid.id]) /
            Number(swapTodos[0].pool.rates?.[tokenIn.id])).toString()
        : (0, exports.calculateMarketPrice)(swapTodos[0].pool, tokenIn, tokenMid);
    const marketPrice2 = isPool2StablePool
        ? (Number(swapTodos[1].pool.rates?.[tokenOut.id]) /
            Number(swapTodos[1].pool.rates?.[tokenMid.id])).toString()
        : (0, exports.calculateMarketPrice)(swapTodos[1].pool, tokenMid, tokenOut);
    const generalMarketPrice = math.evaluate(`${marketPrice1} * ${marketPrice2}`);
    const tokenMidReceived = isPool1StablePool
        ? swapTodos[0].noFeeAmountOut
        : (0, exports.calculateAmountReceived)(swapTodos[0].pool, (0, exports.toNonDivisibleNumber)(tokenIn.decimals, tokenInAmount), tokenIn, tokenMid);
    const formattedTokenMidReceived = (0, exports.scientificNotationToString)(tokenMidReceived?.toString() || "0");
    let stableOutPool2;
    if (isPool2StablePool) {
        const stablePool2 = stablePools.find((p) => p.id === swapTodos[1].pool.id) || stablePools[0];
        const stableOut = (0, stable_swap_1.getSwappedAmount)(tokenMid.id, tokenOut.id, formattedTokenMidReceived, stablePool2, (0, exports.getStablePoolDecimal)(stablePool2));
        stableOutPool2 =
            stableOut[0] < 0
                ? "0"
                : (0, exports.toPrecision)((0, exports.scientificNotationToString)(stableOut[2].toString()), 0);
        stableOutPool2 = (0, exports.toReadableNumber)((0, exports.getStablePoolDecimal)(stablePool2), stableOutPool2);
    }
    const tokenOutReceived = isPool2StablePool
        ? stableOutPool2
        : (0, exports.calculateAmountReceived)(swapTodos[1].pool, (0, exports.toNonDivisibleNumber)(tokenMid.decimals, formattedTokenMidReceived), tokenMid, tokenOut);
    const newMarketPrice = math.evaluate(`${tokenInAmount} / ${tokenOutReceived}`);
    const PriceImpact = new big_js_1.default(newMarketPrice)
        .minus(new big_js_1.default(generalMarketPrice))
        .div(newMarketPrice)
        .times(100)
        .toString();
    return (0, exports.scientificNotationToString)(PriceImpact);
};
exports.calculateSmartRoutingPriceImpact = calculateSmartRoutingPriceImpact;
const percent = (numerator, denominator) => {
    return math.evaluate(`(${numerator} / ${denominator}) * 100`);
};
exports.percent = percent;
const calcStableSwapPriceImpact = (from, to, marketPrice = "1") => {
    const newMarketPrice = math.evaluate(`${from} / ${to}`);
    return math.format((0, exports.percent)(math.evaluate(`${newMarketPrice} - ${marketPrice}`), newMarketPrice), {
        notation: "fixed",
    });
};
exports.calcStableSwapPriceImpact = calcStableSwapPriceImpact;
const calculatePriceImpact = (pools, tokenIn, tokenOut, tokenInAmount) => {
    let in_balance = "0", out_balance = "0";
    pools.forEach((pool, i) => {
        const cur_in_balance = (0, exports.toReadableNumber)(tokenIn.decimals, pool.supplies[tokenIn.id]);
        const cur_out_balance = (0, exports.toReadableNumber)(tokenOut.decimals, pool.supplies[tokenOut.id]);
        in_balance = new big_js_1.default(in_balance).plus(cur_in_balance).toString();
        out_balance = new big_js_1.default(out_balance).plus(cur_out_balance).toString();
    });
    const finalMarketPrice = math.evaluate(`(${in_balance} / ${out_balance})`);
    const separatedReceivedAmount = pools.map((pool) => {
        return (0, exports.calculateAmountReceived)(pool, pool.partialAmountIn || "0", tokenIn, tokenOut);
    });
    const finalTokenOutReceived = math.sum(...separatedReceivedAmount);
    const newMarketPrice = math.evaluate(`${tokenInAmount} / ${finalTokenOutReceived}`);
    const PriceImpact = new big_js_1.default(newMarketPrice)
        .minus(new big_js_1.default(finalMarketPrice))
        .div(newMarketPrice)
        .times(100)
        .toString();
    return (0, exports.scientificNotationToString)(PriceImpact);
};
exports.calculatePriceImpact = calculatePriceImpact;
function calculateSmartRoutesV2PriceImpact(actions, outputToken, tokenInPara, stablePools) {
    const routes = (0, exports.separateRoutes)(actions, outputToken);
    const tokenIn = routes[0][0].tokens?.[0] || tokenInPara;
    const totalInputAmount = routes[0][0].totalInputAmount;
    const priceImpactForRoutes = routes.map((r, i) => {
        const readablePartialAmountIn = (0, exports.toReadableNumber)(tokenIn.decimals, r[0].pool.partialAmountIn);
        if (r.length > 1) {
            const tokenIn = r[0].tokens?.[0];
            const tokenMid = r[0].tokens?.[1];
            const tokenOut = r[0].tokens?.[2];
            return (0, exports.calculateSmartRoutingPriceImpact)(readablePartialAmountIn, routes[i], tokenIn || tokenInPara, tokenMid || tokenInPara, tokenOut || tokenInPara, stablePools);
        }
        else {
            return (0, exports.isStablePool)(stablePools, r[0].pool.id)
                ? (0, exports.calcStableSwapPriceImpact)(readablePartialAmountIn, r[0].noFeeAmountOut || "0", (Number(r[0].pool.rates?.[outputToken]) /
                    Number(r[0].pool.rates?.[tokenIn.id])).toString())
                : (0, exports.calculatePriceImpact)([r[0].pool], r[0].tokens?.[0] || tokenIn, r[0].tokens?.[1] || tokenIn, readablePartialAmountIn);
        }
    });
    const rawRes = priceImpactForRoutes.reduce((pre, cur, i) => {
        return pre.plus(new big_js_1.default(routes[i][0].pool.partialAmountIn || "0")
            .div(new big_js_1.default(totalInputAmount || "1"))
            .mul(cur));
    }, new big_js_1.default(0));
    return (0, exports.scientificNotationToString)(rawRes.toString());
}
const getPriceImpact = ({ estimates, tokenIn, tokenOut, amountIn, amountOut, stablePools, }) => {
    let PriceImpactValue = "0";
    let priceImpactValueSmartRouting = "0";
    let priceImpactValueSmartRoutingV2 = "0";
    if (typeof estimates === "undefined")
        return "0";
    try {
        if (estimates?.length === 2 && estimates[0].status === swap_1.PoolMode.SMART) {
            priceImpactValueSmartRouting = (0, exports.calculateSmartRoutingPriceImpact)(amountIn, estimates, tokenIn, estimates[0].tokens?.[1] || tokenIn, tokenOut, stablePools);
        }
        else if (estimates?.length === 1 &&
            estimates[0].status === swap_1.PoolMode.STABLE) {
            priceImpactValueSmartRouting = (0, exports.calcStableSwapPriceImpact)((0, exports.toReadableNumber)(tokenIn.decimals, estimates[0].totalInputAmount), estimates[0].noFeeAmountOut || "0", (Number(estimates[0].pool.rates?.[tokenOut.id]) /
                Number(estimates[0].pool.rates?.[tokenIn.id])).toString());
        }
        else
            priceImpactValueSmartRouting = "0";
    }
    catch (error) {
        priceImpactValueSmartRouting = "0";
    }
    try {
        priceImpactValueSmartRoutingV2 = calculateSmartRoutesV2PriceImpact(estimates, tokenOut.id, tokenIn, stablePools);
    }
    catch (error) {
        priceImpactValueSmartRoutingV2 = "0";
    }
    try {
        if (estimates[0].status === swap_1.PoolMode.SMART ||
            estimates[0].status === swap_1.PoolMode.STABLE) {
            PriceImpactValue = priceImpactValueSmartRouting;
        }
        else {
            PriceImpactValue = priceImpactValueSmartRoutingV2;
        }
        return PriceImpactValue;
    }
    catch (error) {
        return "0";
    }
};
exports.getPriceImpact = getPriceImpact;
const subtraction = (initialValue, toBeSubtract) => {
    return math.format(math.evaluate(`${initialValue} - ${toBeSubtract}`), {
        notation: "fixed",
    });
};
exports.subtraction = subtraction;
function getPoolAllocationPercents(pools) {
    if (pools.length === 1)
        return ["100"];
    if (pools) {
        const partialAmounts = pools.map((pool) => {
            return math.bignumber(pool.partialAmountIn);
        });
        const ps = new Array(partialAmounts.length).fill("0");
        const sum = partialAmounts.length === 1
            ? partialAmounts[0]
            : math.sum(...partialAmounts);
        const sortedAmount = (0, lodash_1.sortBy)(partialAmounts, (p) => Number(p));
        let minIndexes = [];
        for (let k = 0; k < sortedAmount.length - 1; k++) {
            let minIndex = -1;
            for (let j = 0; j < partialAmounts.length; j++) {
                if (partialAmounts[j].eq(sortedAmount[k]) && !minIndexes.includes(j)) {
                    minIndex = j;
                    minIndexes.push(j);
                    break;
                }
            }
            const res = math
                .round((0, exports.percent)(partialAmounts[minIndex].toString(), sum.toString()))
                .toString();
            if (Number(res) === 0) {
                ps[minIndex] = "1";
            }
            else {
                ps[minIndex] = res;
            }
        }
        const finalPIndex = ps.indexOf("0");
        ps[finalPIndex] = (0, exports.subtraction)("100", String(ps.length === 1 ? Number(ps[0]) : math.sum(...ps.map((p) => Number(p))))).toString();
        return ps;
    }
    else {
        return [];
    }
}
const isMobile = () => {
    return window.screen.width <= 600;
};
exports.isMobile = isMobile;
function divide(numerator, denominator) {
    return math.format(math.evaluate(`${numerator} / ${denominator}`), {
        notation: "fixed",
    });
}
const getMax = function (id, amount) {
    return id !== constant_2.WRAP_NEAR_CONTRACT_ID
        ? amount
        : Number(amount) <= 0.5
            ? "0"
            : String(Number(amount) - 0.5);
};
exports.getMax = getMax;
function getPointByPrice(pointDelta, price, decimalRate, noNeedSlot) {
    const point = Math.log(+price * decimalRate) / Math.log(constant_3.CONSTANT_D);
    const point_int = Math.round(point);
    let point_int_slot = point_int;
    if (!noNeedSlot) {
        point_int_slot = Math.floor(point_int / pointDelta) * pointDelta;
    }
    if (point_int_slot < constant_3.POINTLEFTRANGE) {
        return constant_3.POINTLEFTRANGE;
    }
    else if (point_int_slot > constant_3.POINTRIGHTRANGE) {
        return 800000;
    }
    return point_int_slot;
}
const feeToPointDelta = (fee) => {
    switch (fee) {
        case 100:
            return 1;
        case 400:
            return 8;
        case 2000:
            return 40;
        case 10000:
            return 200;
        default:
            throw (0, error_1.NoFeeToPool)(fee);
    }
};
exports.feeToPointDelta = feeToPointDelta;
const pointToPrice = ({ tokenA, tokenB, point, }) => {
    const undecimal_price = Math.pow(constant_3.CONSTANT_D, point);
    const decimal_price_A_by_B = new big_js_1.default(undecimal_price)
        .times(new big_js_1.default(10).pow(tokenA.decimals))
        .div(new big_js_1.default(10).pow(tokenB.decimals));
    return (0, exports.scientificNotationToString)(decimal_price_A_by_B.toString());
};
exports.pointToPrice = pointToPrice;
const registerAccountOnToken = (AccountId) => {
    return {
        methodName: "storage_deposit",
        args: {
            registration_only: true,
            account_id: AccountId,
        },
        gas: "30000000000000",
        amount: constant_2.STORAGE_TO_REGISTER_WITH_MFT,
    };
};
exports.registerAccountOnToken = registerAccountOnToken;
//# sourceMappingURL=utils.js.map