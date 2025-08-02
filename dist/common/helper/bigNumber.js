"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initZeroBigNumber = exports.BigNumber = void 0;
exports.bigNumber = bigNumber;
exports.toString = toString;
exports.toNumber = toNumber;
exports.isFalsy = isFalsy;
exports.formatBalance = formatBalance;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
exports.BigNumber = bignumber_js_1.default;
function bigNumber(value) {
    return new bignumber_js_1.default(String(value || 0).trim());
}
function toString(value, options) {
    if (options?.notANumber) {
        return value?.toString();
    }
    if (typeof value === "object" || typeof value === "number") {
        const temp = value?.toString();
        if (temp.includes("e-")) {
            return new bignumber_js_1.default(temp).plus(1).toString().replace("1", "0");
        }
        return temp;
    }
    else {
        if (value.includes("e-")) {
            return new bignumber_js_1.default(value).plus(1).toString().replace("1", "0");
        }
        return value || "";
    }
}
function toNumber(value) {
    if (typeof value === "object") {
        return value?.toNumber() || 0;
    }
    if (typeof value === "string") {
        return new bignumber_js_1.default(value || 0).toNumber();
    }
    return Number(value || 0);
}
function isFalsy(value) {
    if (typeof value === "object") {
        return (new bignumber_js_1.default(value)?.isEqualTo(0) ||
            new bignumber_js_1.default(value)?.isNaN());
    }
    return new bignumber_js_1.default(value || 0)?.isEqualTo(0) || !value;
}
const initZeroBigNumber = bigNumber(0);
exports.initZeroBigNumber = initZeroBigNumber;
// precision = Math.pow(10, -8),
function formatBalance(value, precision = 8, options) {
    try {
        const fmt = {
            decimalSeparator: ".",
            groupSeparator: options?.noGroupSeparator ? undefined : ",",
            groupSize: 3,
        };
        let originalValueFormatted = "";
        // if (options?.roundDown) {
        originalValueFormatted = bigNumber(toNumber(value)).toFormat(toNumber(precision), bignumber_js_1.default.ROUND_DOWN, fmt);
        originalValueFormatted = originalValueFormatted.replace(/\.?0+$/, "");
        if (options?.prefix) {
            originalValueFormatted = `${options.prefix}${originalValueFormatted}`;
        }
        if (options?.suffix) {
            originalValueFormatted = `${originalValueFormatted}${options.suffix}`;
        }
        return originalValueFormatted;
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.log(error);
        return "";
    }
}
//# sourceMappingURL=bigNumber.js.map