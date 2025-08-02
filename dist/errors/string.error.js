"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StringError = void 0;
class StringError extends Error {
    constructor(message) {
        super();
        this.name = "StringError";
        this.message = message;
    }
}
exports.StringError = StringError;
//# sourceMappingURL=string.error.js.map