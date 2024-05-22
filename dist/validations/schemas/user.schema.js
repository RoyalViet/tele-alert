"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
exports.default = {
    register: {
        body: joi_1.default.object().keys({
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().min(6).max(30).required(),
            firstName: joi_1.default.string().min(3).max(100).required(),
            lastName: joi_1.default.string().min(3).max(100).required(),
        }),
    },
    login: {
        body: joi_1.default.object().keys({
            email: joi_1.default.string().email().required(),
            password: joi_1.default.string().required(),
        }),
    },
    updateMe: {
        body: joi_1.default.object().keys({
            firstName: joi_1.default.string().min(3).max(100).required(),
            lastName: joi_1.default.string().min(3).max(100).required(),
        }),
    },
};
//# sourceMappingURL=user.schema.js.map