"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePushPhotoTelegramNotificationController = exports.handlePushTelegramNotificationController = exports.sendAnimation = exports.getTelegramPage = exports.getHomePage = void 0;
const telegramService = __importStar(require("../../services/telegram/telegramService"));
const getHomePage = (req, res) => {
    // return res.render("homepage.ejs");
    return res.send("Express TS on Vercel");
};
exports.getHomePage = getHomePage;
const queue = [];
let isProcessing = false;
const processQueue = async () => {
    if (isProcessing || queue.length === 0)
        return;
    isProcessing = true;
    const { req, resolve, reject } = queue.shift(); // Sử dụng '!' để đảm bảo không null
    try {
        await telegramService.sendNotification(req.body);
        resolve();
    }
    catch (error) {
        console.log("error :", error?.message);
        reject(error);
    }
    finally {
        isProcessing = false;
        // Gọi lại processQueue sau 1 giây nếu còn yêu cầu trong hàng đợi
        setTimeout(processQueue, 1000);
    }
};
// const handlePushTelegramNotificationController = (
//   req: Request,
//   _res?: any
// ): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     queue.push({ req, resolve, reject });
//     processQueue();
//   });
// };
const handlePushTelegramNotificationController = async (req) => {
    try {
        await telegramService.sendNotification(req.body);
    }
    catch (error) {
        console.log("error :", error?.message);
    }
};
exports.handlePushTelegramNotificationController = handlePushTelegramNotificationController;
const handlePushPhotoTelegramNotificationController = async (req) => {
    try {
        console.log("send :", req.body);
        await telegramService.sendPhoto(req.body, req.img);
        console.log("done!");
    }
    catch (error) {
        console.log("error :", error?.message);
    }
};
exports.handlePushPhotoTelegramNotificationController = handlePushPhotoTelegramNotificationController;
const getTelegramPage = (req, res) => {
    return res.render("telegram.ejs");
};
exports.getTelegramPage = getTelegramPage;
const sendAnimation = async () => {
    await telegramService.sendMeAGif();
    return;
};
exports.sendAnimation = sendAnimation;
//# sourceMappingURL=homepageController.js.map