"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = exports.getDetailToken = void 0;
const typeorm_1 = require("typeorm");
const token_entity_1 = require("../../entities/token/token.entity");
const api_utility_1 = __importDefault(require("../../utilities/api.utility"));
const where = {};
const createToken = async (params) => {
    const item = new token_entity_1.Token();
    item.token_contract = params.token_contract;
    item.token_account_ids = params.token_account_ids.join(",");
    item.token_symbols = params.token_symbols.join(",");
    item.token_price = params.token_price;
    item.liq = params.liq;
    item.pool_id = params.pool_id;
    item.network = params.network;
    const tokenData = await (0, typeorm_1.getRepository)(token_entity_1.Token).save(item);
    return api_utility_1.default.sanitizeData(tokenData);
};
exports.createToken = createToken;
const getDetailToken = async (params) => {
    const query = {
        where: {
            ...where,
            ...(params?.pool_id && { pool_id: params.pool_id }),
            ...(params?.id && { id: params.id }),
        },
    };
    const tokenInfo = await (0, typeorm_1.getRepository)(token_entity_1.Token).findOne(query);
    return api_utility_1.default.sanitizeData(tokenInfo);
};
exports.getDetailToken = getDetailToken;
//# sourceMappingURL=token.service.js.map