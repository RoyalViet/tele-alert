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
exports.createToken = exports.getDetailToken = void 0;
const typeorm_1 = require("typeorm");
const token_entity_1 = require("../../entities/token/token.entity");
const api_utility_1 = __importDefault(require("../../utilities/api.utility"));
const where = {};
const createToken = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const item = new token_entity_1.Token();
    item.token_contract = params.token_contract;
    item.token_account_ids = params.token_account_ids.join(",");
    item.token_symbols = params.token_symbols.join(",");
    item.token_price = params.token_price;
    item.liq = params.liq;
    item.pool_id = params.pool_id;
    item.network = params.network;
    const tokenData = yield (0, typeorm_1.getRepository)(token_entity_1.Token).save(item);
    return api_utility_1.default.sanitizeData(tokenData);
});
exports.createToken = createToken;
const getDetailToken = (params) => __awaiter(void 0, void 0, void 0, function* () {
    const query = {
        where: Object.assign(Object.assign(Object.assign({}, where), ((params === null || params === void 0 ? void 0 : params.pool_id) && { pool_id: params.pool_id })), ((params === null || params === void 0 ? void 0 : params.id) && { id: params.id })),
    };
    const tokenInfo = yield (0, typeorm_1.getRepository)(token_entity_1.Token).findOne(query);
    return api_utility_1.default.sanitizeData(tokenInfo);
});
exports.getDetailToken = getDetailToken;
//# sourceMappingURL=token.service.js.map