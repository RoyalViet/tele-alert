"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
const typeorm_1 = require("typeorm");
// Entities
const base_entity_1 = require("../base/base.entity");
let Token = class Token extends base_entity_1.BaseEntity {
};
exports.Token = Token;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: "int" }),
    __metadata("design:type", Number)
], Token.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", default: "" }),
    __metadata("design:type", String)
], Token.prototype, "token_contract", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", default: "" }),
    __metadata("design:type", String)
], Token.prototype, "token_account_ids", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", default: "" }),
    __metadata("design:type", String)
], Token.prototype, "token_symbols", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "double", nullable: false, default: 0 }),
    __metadata("design:type", Number)
], Token.prototype, "token_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "float", nullable: false, default: 0 }),
    __metadata("design:type", Number)
], Token.prototype, "liq", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", nullable: false, default: 0 }),
    __metadata("design:type", Number)
], Token.prototype, "pool_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: false, default: "" }),
    __metadata("design:type", String)
], Token.prototype, "network", void 0);
exports.Token = Token = __decorate([
    (0, typeorm_1.Entity)("token_info", { orderBy: { id: "DESC" } })
], Token);
//# sourceMappingURL=token.entity.js.map