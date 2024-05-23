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
exports.isAdmin = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// Utilities
const api_response_utility_1 = __importDefault(require("../utilities/api-response.utility"));
const isAdmin = () => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.user.email !== process.env.ADMIN_EMAIL) {
            return api_response_utility_1.default.error(res, http_status_codes_1.default.UNAUTHORIZED);
        }
        next();
    });
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=permission-handler.middleware.js.map