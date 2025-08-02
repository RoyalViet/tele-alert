"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSwappedAmount = exports.calc_swap = exports.calc_y = exports.calc_d = void 0;
const constant_1 = require("./constant");
const utils_1 = require("./utils");
const big_js_1 = __importDefault(require("big.js"));
const lodash_1 = __importDefault(require("lodash"));
const tradeFee = (amount, trade_fee) => {
    return (amount * trade_fee) / constant_1.FEE_DIVISOR;
};
const calc_d = (amp, c_amounts) => {
    const token_num = c_amounts.length;
    const sum_amounts = lodash_1.default.sum(c_amounts);
    let d_prev = 0;
    let d = sum_amounts;
    for (let i = 0; i < 256; i++) {
        let d_prod = d;
        for (let c_amount of c_amounts) {
            d_prod = (d_prod * d) / (c_amount * token_num);
        }
        d_prev = d;
        const ann = amp * token_num ** token_num;
        const numerator = d_prev * (d_prod * token_num + ann * sum_amounts);
        const denominator = d_prev * (ann - 1) + d_prod * (token_num + 1);
        d = numerator / denominator;
        if (Math.abs(d - d_prev) <= 1)
            break;
    }
    return d;
};
exports.calc_d = calc_d;
const calc_y = (amp, x_c_amount, current_c_amounts, index_x, index_y) => {
    const token_num = current_c_amounts.length;
    const ann = amp * token_num ** token_num;
    const d = (0, exports.calc_d)(amp, current_c_amounts);
    let s = x_c_amount;
    let c = (d * d) / x_c_amount;
    for (let i = 0; i < token_num; i++) {
        if (i !== index_x && i !== index_y) {
            s += current_c_amounts[i];
            c = (c * d) / current_c_amounts[i];
        }
    }
    c = (c * d) / (ann * token_num ** token_num);
    const b = d / ann + s;
    let y_prev = 0;
    let y = d;
    for (let i = 0; i < 256; i++) {
        y_prev = y;
        const y_numerator = y ** 2 + c;
        const y_denominator = 2 * y + b - d;
        y = y_numerator / y_denominator;
        if (Math.abs(y - y_prev) <= 1)
            break;
    }
    return y;
};
exports.calc_y = calc_y;
const calc_swap = (amp, in_token_idx, in_c_amount, out_token_idx, old_c_amounts, trade_fee) => {
    const y = (0, exports.calc_y)(amp, in_c_amount + old_c_amounts[in_token_idx], old_c_amounts, in_token_idx, out_token_idx);
    const dy = old_c_amounts[out_token_idx] - y;
    const fee = tradeFee(dy, trade_fee);
    const amount_swapped = dy - fee;
    return [amount_swapped, fee, dy];
};
exports.calc_swap = calc_swap;
const getSwappedAmount = (tokenInId, tokenOutId, amountIn, stablePool, STABLE_LP_TOKEN_DECIMALS) => {
    const amp = stablePool.amp;
    const trade_fee = stablePool.total_fee;
    // depended on pools
    const in_token_idx = stablePool.token_account_ids.findIndex((id) => id === tokenInId);
    const out_token_idx = stablePool.token_account_ids.findIndex((id) => id === tokenOutId);
    const rates = stablePool.rates.map((r) => (0, utils_1.toReadableNumber)(STABLE_LP_TOKEN_DECIMALS, r));
    const base_old_c_amounts = stablePool.c_amounts.map((amount) => (0, utils_1.toReadableNumber)(STABLE_LP_TOKEN_DECIMALS, amount));
    const old_c_amounts = base_old_c_amounts
        .map((amount, i) => (0, utils_1.toNonDivisibleNumber)(STABLE_LP_TOKEN_DECIMALS, (0, utils_1.scientificNotationToString)(new big_js_1.default(amount || 0).times(new big_js_1.default(rates[i])).toString())))
        .map((amount) => Number(amount));
    const in_c_amount = Number((0, utils_1.toNonDivisibleNumber)(STABLE_LP_TOKEN_DECIMALS, (0, utils_1.scientificNotationToString)(new big_js_1.default(amountIn).times(new big_js_1.default(rates[in_token_idx])).toString())));
    const [amount_swapped, fee, dy] = (0, exports.calc_swap)(amp, in_token_idx, in_c_amount, out_token_idx, old_c_amounts, trade_fee);
    return [
        amount_swapped / Number(rates[out_token_idx]),
        fee,
        dy / Number(rates[out_token_idx]),
    ];
};
exports.getSwappedAmount = getSwappedAmount;
//# sourceMappingURL=stable-swap.js.map