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
exports.createTokenController = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// Services
const tokenService = __importStar(require("../../services/token/token.service"));
// Utilities
const api_response_utility_1 = __importDefault(require("../../utilities/api-response.utility"));
const createTokenController = async (req, res) => {
    try {
        const params = {
            liq: req.body.liq,
            token_account_ids: req.body.token_account_ids,
            token_price: req.body.token_price,
            token_symbols: req.body.token_symbols,
            pool_id: req.body.pool_id,
            token_contract: req.body.token_contract,
        };
        const token = await tokenService.createToken(params);
        return api_response_utility_1.default.result(res, token, http_status_codes_1.default.CREATED);
    }
    catch (e) {
        return api_response_utility_1.default.error(res, http_status_codes_1.default.BAD_REQUEST);
    }
};
exports.createTokenController = createTokenController;
//# sourceMappingURL=token.controller.js.map