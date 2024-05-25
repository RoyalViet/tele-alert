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
exports.UpdateDefaultDateInUserTable1716655316919 = void 0;
class UpdateDefaultDateInUserTable1716655316919 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`
        ALTER TABLE user
        ALTER COLUMN updated_at SET DEFAULT (UNIX_TIMESTAMP())
    `);
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.query(`
        ALTER TABLE user
        ALTER COLUMN updated_at DROP DEFAULT
    `);
        });
    }
}
exports.UpdateDefaultDateInUserTable1716655316919 = UpdateDefaultDateInUserTable1716655316919;
//# sourceMappingURL=1716655316919-UpdateDefaultDateInUserTable.js.map