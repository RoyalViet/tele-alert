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
exports.SeedUserTable1716655430300 = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../entities/user/user.entity");
const user_seed_1 = require("../seeds/user.seed");
class SeedUserTable1716655430300 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, typeorm_1.getRepository)(user_entity_1.User).save(user_seed_1.userSeed);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
}
exports.SeedUserTable1716655430300 = SeedUserTable1716655430300;
//# sourceMappingURL=1716655430300-SeedUserTable.js.map