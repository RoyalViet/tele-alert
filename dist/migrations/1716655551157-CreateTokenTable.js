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
exports.CreateTokenTable1716655551157 = void 0;
const typeorm_1 = require("typeorm");
class CreateTokenTable1716655551157 {
    up(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.createTable(new typeorm_1.Table({
                name: "token_info",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "token_contract",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "token_account_ids",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "token_symbols",
                        type: "varchar",
                        length: "255",
                        isNullable: false,
                    },
                    {
                        name: "token_price",
                        type: "double",
                        default: "0",
                    },
                    {
                        name: "liq",
                        type: "float",
                        default: "0",
                    },
                    {
                        name: "pool_id",
                        type: "int",
                        default: "0",
                    },
                    {
                        name: "network",
                        type: "varchar",
                        length: "255",
                        isNullable: true,
                    },
                    {
                        name: "created_at",
                        type: "bigint",
                        default: "(UNIX_TIMESTAMP())",
                    },
                    {
                        name: "updated_at",
                        type: "bigint",
                        default: "(UNIX_TIMESTAMP())",
                    },
                ],
            }));
        });
    }
    down(queryRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            yield queryRunner.dropTable("token_info");
        });
    }
}
exports.CreateTokenTable1716655551157 = CreateTokenTable1716655551157;
//# sourceMappingURL=1716655551157-CreateTokenTable.js.map