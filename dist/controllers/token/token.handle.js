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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.alertTokenHandle = exports.createTokenHandle = void 0;
// Services
const tokenService = __importStar(require("../../services/token/token.service"));
const telegramService = __importStar(require("../../services/telegram/telegramService"));
const bigNumber_1 = require("../../common/helper/bigNumber");
// Utilities
const createTokenHandle = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = yield tokenService.createToken(params);
    }
    catch (e) {
        //
    }
});
exports.createTokenHandle = createTokenHandle;
const telegramAlertToken = (params) => __awaiter(void 0, void 0, void 0, function* () {
    yield telegramService.sendNotification(Object.assign(Object.assign({}, params), { pool_id: params.pool_id, token_account_ids: params.token_account_ids, token_symbols: params.token_symbols, token_price: (0, bigNumber_1.formatBalance)(params.token_price), liq: (0, bigNumber_1.formatBalance)(params.liq) }), {
        isGenerateTelegramHTML: true,
    });
});
const alertTokenHandle = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = yield tokenService.getDetailToken(params);
        if (!token) {
            telegramAlertToken(params);
            yield tokenService.createToken(params);
        }
    }
    catch (error) {
        yield telegramAlertToken(params);
    }
});
exports.alertTokenHandle = alertTokenHandle;
//# sourceMappingURL=token.handle.js.map