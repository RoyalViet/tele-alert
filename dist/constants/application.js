"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const basePath = "/";
exports.default = {
    url: {
        basePath,
    },
    timers: {
        userCookieExpiry: "720h",
    },
    env: {
        authSecret: process.env.TOKEN_SECRET_KEY || "token_key",
    },
    authorizationIgnorePath: ["/", "/auth/login", "/auth/register"],
    publicPath: "/public",
};
//# sourceMappingURL=application.js.map