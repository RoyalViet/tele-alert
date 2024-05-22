"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testF = void 0;
const axios_1 = __importDefault(require("axios"));
const bigNumber_1 = require("./common/helper/bigNumber");
function testF() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        console.log("running ...");
        const raw = yield axios_1.default.get(`https://api.ref.finance/list-pools`, {});
        // console.log("raw :", raw?.data);
        const filter = (_a = raw === null || raw === void 0 ? void 0 : raw.data) === null || _a === void 0 ? void 0 : _a.filter((i) => (0, bigNumber_1.bigNumber)(i === null || i === void 0 ? void 0 : i.tvl).gt(0) &&
            (0, bigNumber_1.bigNumber)(i === null || i === void 0 ? void 0 : i.token0_ref_price).gt(0) &&
            (i === null || i === void 0 ? void 0 : i.token_account_ids).includes("dd.tg") &&
            ((i === null || i === void 0 ? void 0 : i.token_account_ids).includes("wrap.near") ||
                (i === null || i === void 0 ? void 0 : i.token_account_ids).includes("usdt.tether-token.near")));
        console.log("rs :", filter
            // .sort((a: any, b: any) => (bigNumber(a.tvl).gte(b.tvl) ? -1 : 1))
            .sort((a, b) => ((0, bigNumber_1.bigNumber)(a.tvl).gte(b.tvl) ? 1 : -1))
            .map((i) => {
            return {
                // ...i,
                id: i === null || i === void 0 ? void 0 : i.id,
                // token_account_ids: i?.token_account_ids,
                // token_symbols: i?.token_symbols,
                token_account_ids: i === null || i === void 0 ? void 0 : i.token_account_ids.filter((i) => i !== "wrap.near")[0],
                token_symbols: i === null || i === void 0 ? void 0 : i.token_symbols.filter((i) => i !== "wNEAR")[0],
                token_price: i === null || i === void 0 ? void 0 : i.token0_ref_price,
                liq: (0, bigNumber_1.formatBalance)(i === null || i === void 0 ? void 0 : i.tvl),
            };
        }));
    });
}
exports.testF = testF;
//# sourceMappingURL=test.js.map