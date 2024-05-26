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
exports.BaseEntity = void 0;
const typeorm_1 = require("typeorm");
class BaseEntity {
    beforeInsert() {
        if (!this.created_at) {
            this.created_at = new Date().getTime().toString();
            this.updated_at = new Date().getTime().toString();
        }
    }
    beforeUpdated() {
        this.updated_at = new Date().getTime().toString();
    }
}
exports.BaseEntity = BaseEntity;
__decorate([
    (0, typeorm_1.Column)("bigint", {
        name: "created_at",
        nullable: true,
        default: new Date().getTime().toString(),
    }),
    __metadata("design:type", String)
], BaseEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)("bigint", {
        name: "updated_at",
        nullable: true,
        default: new Date().getTime().toString(),
    }),
    __metadata("design:type", String)
], BaseEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BaseEntity.prototype, "beforeInsert", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BaseEntity.prototype, "beforeUpdated", null);
//# sourceMappingURL=base.entity.js.map