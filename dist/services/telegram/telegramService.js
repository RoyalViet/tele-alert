"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMeAGif = exports.sendNotification = void 0;
const axios_1 = __importDefault(require("axios"));
const common_helper_1 = require("../../common/helper/common.helper");
require("dotenv").config();
const sendNotification = (msg, options) => {
    return new Promise((resolve, reject) => {
        try {
            let TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
            let TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;
            let data = {
                chat_id: TELEGRAM_GROUP_ID,
                parse_mode: "HTML",
                text: (options === null || options === void 0 ? void 0 : options.isGenerateTelegramHTML) ? (0, common_helper_1.generateTelegramHTML)(msg) : msg,
            };
            axios_1.default
                .get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                params: data,
            })
                .then(() => {
                resolve("done!");
            })
                .catch((err) => {
                console.log(err);
                reject(err);
            });
        }
        catch (e) {
            reject(e);
        }
    });
};
exports.sendNotification = sendNotification;
const sendMeAGif = () => {
    return new Promise((resolve, reject) => {
        try {
            let TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
            let TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;
            let data = {
                chat_id: TELEGRAM_GROUP_ID,
                parse_mode: "HTML",
                animation: "https://media.giphy.com/media/mCRJDo24UvJMA/giphy.gif",
                caption: "<b>Check out</b> my <i>new gif</i>",
            };
            axios_1.default
                .post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendAnimation`, data)
                .then(() => {
                resolve("done!");
            })
                .catch((err) => {
                console.log(err);
                reject(err);
            });
        }
        catch (e) {
            reject(e);
        }
    });
};
exports.sendMeAGif = sendMeAGif;
//# sourceMappingURL=telegramService.js.map