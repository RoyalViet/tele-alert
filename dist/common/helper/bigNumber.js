"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBalance = exports.initZeroBigNumber = exports.BigNumber = exports.isFalsy = exports.toNumber = exports.toString = exports.bigNumber = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
exports.BigNumber = bignumber_js_1.default;
function bigNumber(value) {
    return new bignumber_js_1.default(String(value || 0).trim());
}
exports.bigNumber = bigNumber;
function toString(value, options) {
    if (options === null || options === void 0 ? void 0 : options.notANumber) {
        return value === null || value === void 0 ? void 0 : value.toString();
    }
    if (typeof value === "object" || typeof value === "number") {
        const temp = value === null || value === void 0 ? void 0 : value.toString();
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
exports.toString = toString;
function toNumber(value) {
    if (typeof value === "object") {
        return (value === null || value === void 0 ? void 0 : value.toNumber()) || 0;
    }
    if (typeof value === "string") {
        return new bignumber_js_1.default(value || 0).toNumber();
    }
    return Number(value || 0);
}
exports.toNumber = toNumber;
function isFalsy(value) {
    var _a, _b, _c;
    if (typeof value === "object") {
        return (((_a = new bignumber_js_1.default(value)) === null || _a === void 0 ? void 0 : _a.isEqualTo(0)) ||
            ((_b = new bignumber_js_1.default(value)) === null || _b === void 0 ? void 0 : _b.isNaN()));
    }
    return ((_c = new bignumber_js_1.default(value || 0)) === null || _c === void 0 ? void 0 : _c.isEqualTo(0)) || !value;
}
exports.isFalsy = isFalsy;
const initZeroBigNumber = bigNumber(0);
exports.initZeroBigNumber = initZeroBigNumber;
// precision = Math.pow(10, -8),
function formatBalance(value, precision = 8, options) {
    try {
        const fmt = {
            decimalSeparator: ".",
            groupSeparator: (options === null || options === void 0 ? void 0 : options.noGroupSeparator) ? undefined : ",",
            groupSize: 3,
        };
        let originalValueFormatted = "";
        // if (options?.roundDown) {
        originalValueFormatted = bigNumber(toNumber(value)).toFormat(toNumber(precision), bignumber_js_1.default.ROUND_DOWN, fmt);
        originalValueFormatted = originalValueFormatted.replace(/\.?0+$/, "");
        if (options === null || options === void 0 ? void 0 : options.prefix) {
            originalValueFormatted = `${options.prefix}${originalValueFormatted}`;
        }
        if (options === null || options === void 0 ? void 0 : options.suffix) {
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
exports.formatBalance = formatBalance;
//# sourceMappingURL=bigNumber.js.map