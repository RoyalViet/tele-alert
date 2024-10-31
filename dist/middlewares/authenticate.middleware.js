"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_codes_1 = __importDefault(require("http-status-codes"));
// Services
const user_service_1 = __importDefault(require("../services/user/user.service"));
// Utilities
const api_response_utility_1 = __importDefault(require("../utilities/api-response.utility"));
const encryption_utility_1 = __importDefault(require("../utilities/encryption.utility"));
const api_utility_1 = __importDefault(require("../utilities/api.utility"));
// Constants
const constants_1 = __importDefault(require("../constants"));
exports.default = async (req, res, next) => {
    if (constants_1.default.APPLICATION.authorizationIgnorePath.indexOf(`${req.originalUrl}`) === -1 &&
        !req.originalUrl.startsWith(`${constants_1.default.APPLICATION.publicPath}/`)) {
        const authorizationHeader = api_utility_1.default.getCookieFromRequest(req, constants_1.default.COOKIE.COOKIE_USER);
        if (authorizationHeader) {
            const decoded = await encryption_utility_1.default.verifyCookie(authorizationHeader);
            if (decoded) {
                const user = await user_service_1.default.getById({
                    id: decoded.data[constants_1.default.COOKIE.KEY_USER_ID],
                });
                if (user) {
                    // @ts-ignore
                    req.user = user;
                }
                else {
                    return api_response_utility_1.default.error(res, http_status_codes_1.default.UNAUTHORIZED);
                }
            }
            else {
                return api_response_utility_1.default.error(res, http_status_codes_1.default.UNAUTHORIZED);
            }
        }
        else {
            return api_response_utility_1.default.error(res, http_status_codes_1.default.FORBIDDEN);
        }
    }
    next();
};
//# sourceMappingURL=authenticate.middleware.js.map