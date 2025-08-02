import { sendMessageDiscord } from "../../services/discord/discordService";
import * as telegramService from "../../services/telegram/telegramService";

const getHomePage = (params: any, res: any) => {
  // return res.render("homepage.ejs");
  return res.send("Express TS on Vercel");
};

interface IParamNotification {
  body: any;
  img?: string;
  options?: Partial<{ isSol: boolean }>;
}

interface QueueItem {
  params: IParamNotification;
  resolve: () => void;
  reject: (error: any) => void;
}

const queue: QueueItem[] = [];
let isProcessing = false;

const processQueue = async () => {
  if (isProcessing || queue.length === 0) return;

  isProcessing = true;
  const { params, resolve, reject } = queue.shift()!;

  try {
    await telegramService.sendNotification(params.body);
    resolve();
  } catch (error) {
    console.log("error :", error?.message);
    reject(error);
  } finally {
    isProcessing = false;
    setTimeout(processQueue, 1000);
  }
};

// const handlePushNotification = (
//   params: IParamNotification,
//   _res?: any
// ): Promise<void> => {
//   return new Promise((resolve, reject) => {
//     queue.push({ params, resolve, reject });
//     processQueue();
//   });
// };

const handlePushNotification = async (
  params: IParamNotification
): Promise<void> => {
  try {
    sendMessageDiscord(params.body);

    await telegramService.sendNotification(params.body, {
      isSol: params?.options?.isSol,
    });
  } catch (error) {
    console.log("error :", error?.message);
  }
};

const handlePushPhotoTelegramNotification = async (
  params: IParamNotification
) => {
  try {
    console.log("send :", params.body);
    await telegramService.sendPhoto(params.body, params.img);
    console.log("done!");
  } catch (error) {
    console.log("error :", error?.message);
  }
};

const getTelegramPage = (params: any, res: any) => {
  return res.render("telegram.ejs");
};

const sendAnimation = async () => {
  await telegramService.sendMeAGif();
  return;
};

export {
  getHomePage,
  getTelegramPage,
  sendAnimation,
  handlePushNotification,
  handlePushPhotoTelegramNotification,
};
