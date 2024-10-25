"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPhoto = exports.sendMeAGif = exports.sendNotification = void 0;
const axios_1 = __importDefault(require("axios"));
// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;
const TELEGRAM_BOT_TOKEN = "6893137130:AAG7kto4ZePK8Z-SrS1dgUt8BfHeinhkA3A";
const TELEGRAM_GROUP_ID = "1177623428";
const sendNotification = (msg, options) => {
    return new Promise((resolve, reject) => {
        try {
            console.log("send :", msg);
            let data = {
                chat_id: TELEGRAM_GROUP_ID,
                parse_mode: (options === null || options === void 0 ? void 0 : options.isGenerateTelegramHTML) ? "HTML" : "Markdown",
                text: msg,
            };
            axios_1.default
                .get(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                params: data,
            })
                .then(() => {
                console.log("done!");
                resolve("done!");
            })
                .catch((err) => {
                console.log("err :", err === null || err === void 0 ? void 0 : err.message);
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
            let data = {
                chat_id: TELEGRAM_GROUP_ID,
                parse_mode: "HTML",
                animation: "https://media.giphy.com/media/mCRJDo24UvJMA/giphy.gif",
                caption: "<b>Check out</b> my <i>new gif</i>",
            };
            axios_1.default
                .post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendAnimation`, data)
                .then(() => {
                console.log("sendMeAGif done");
                resolve("done!");
            })
                .catch((err) => {
                console.log("err sendMeAGif :", err);
                reject(err);
            });
        }
        catch (e) {
            console.log("e sendMeAGif :", e);
            reject(e);
        }
    });
};
exports.sendMeAGif = sendMeAGif;
const sendPhoto = (msg, imageUrl) => {
    return new Promise((resolve, reject) => {
        try {
            let data = {
                chat_id: TELEGRAM_GROUP_ID,
                parse_mode: "HTML",
                photo: imageUrl,
                caption: msg,
            };
            axios_1.default
                .post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`, data)
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
exports.sendPhoto = sendPhoto;
//# sourceMappingURL=telegramService.js.map