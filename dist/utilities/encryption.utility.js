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
const constants_1 = __importDefault(require("../constants"));
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
class Encryption {
    static generateHash(password, saltRounds) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                bcrypt.hash(password, saltRounds, (err, hash) => {
                    if (!err) {
                        resolve(hash);
                    }
                    reject(err);
                });
            });
        });
    }
    static verifyHash(password, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                bcrypt.compare(password, hash, (err, result) => {
                    if (result) {
                        resolve(true);
                    }
                    resolve(false);
                });
            });
        });
    }
    static generateCookie(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {};
            data[key] = value;
            return yield jwt.sign({ data }, constants_1.default.APPLICATION.env.authSecret, {
                expiresIn: constants_1.default.APPLICATION.timers.userCookieExpiry,
            });
        });
    }
    ;
    static verifyCookie(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                jwt.verify(token, constants_1.default.APPLICATION.env.authSecret, (err, decoded) => {
                    if (err) {
                        resolve(null);
                    }
                    else {
                        resolve(decoded);
                    }
                });
            });
        });
    }
}
exports.default = Encryption;
//# sourceMappingURL=encryption.utility.js.map