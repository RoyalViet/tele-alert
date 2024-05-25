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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedTokenTable1716655672646 = void 0;
const typeorm_1 = require("typeorm");
const token_entity_1 = require("../entities/token/token.entity");
const token_seed_1 = require("../seeds/token.seed");
class SeedTokenTable1716655672646 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, typeorm_1.getRepository)(token_entity_1.Token).save(token_seed_1.tokenSeed);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.SeedTokenTable1716655672646 = SeedTokenTable1716655672646;
//# sourceMappingURL=1716655672646-SeedTokenTable.js.map