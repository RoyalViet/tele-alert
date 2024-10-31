"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// Utilities
const api_response_utility_1 = __importDefault(require("../utilities/api-response.utility"));
const isAdmin = () => {
    return async (req, res, next) => {
        if (req.user.email !== process.env.ADMIN_EMAIL) {
            return api_response_utility_1.default.error(res, http_status_codes_1.default.UNAUTHORIZED);
        }
        next();
    };
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=permission-handler.middleware.js.map