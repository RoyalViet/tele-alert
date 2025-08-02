"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = __importDefault(require("../constants"));
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
class Encryption {
    static async generateHash(password, saltRounds) {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, saltRounds, (err, hash) => {
                if (!err) {
                    resolve(hash);
                }
                reject(err);
            });
        });
    }
    static async verifyHash(password, hash) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hash, (err, result) => {
                if (result) {
                    resolve(true);
                }
                resolve(false);
            });
        });
    }
    static async generateCookie(key, value) {
        const data = {};
        data[key] = value;
        return await jwt.sign({ data }, constants_1.default.APPLICATION.env.authSecret, {
            expiresIn: constants_1.default.APPLICATION.timers.userCookieExpiry,
        });
    }
    ;
    static async verifyCookie(token) {
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
    }
}
exports.default = Encryption;
//# sourceMappingURL=encryption.utility.js.map