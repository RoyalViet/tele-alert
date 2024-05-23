"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// Errors
const string_error_1 = require("../errors/string.error");
class ApiResponse {
    static exception(res, error) {
        if (error instanceof string_error_1.StringError) {
            return ApiResponse.error(res, http_status_codes_1.default.BAD_REQUEST, error.message);
        }
        return ApiResponse.error(res, http_status_codes_1.default.BAD_REQUEST, 'Something went wrong');
    }
}
ApiResponse.result = (res, data, status = 200, cookie = null, pagination = null) => {
    res.status(status);
    if (cookie) {
        res.cookie(cookie.key, cookie.value);
    }
    let responseData = { data, success: true };
    if (pagination) {
        responseData = Object.assign(Object.assign({}, responseData), { pagination });
    }
    res.json(responseData);
};
ApiResponse.error = (res, status = 400, error = http_status_codes_1.default.getStatusText(status), override = null) => {
    res.status(status).json({
        override,
        error: {
            message: error,
        },
        success: false,
    });
};
ApiResponse.setCookie = (res, key, value) => {
    res.cookie(key, value);
};
exports.default = ApiResponse;
//# sourceMappingURL=api-response.utility.js.map