import * as telegramService from "../../services/telegram/telegramService";

const getHomePage = (req: any, res: any) => {
  // return res.render("homepage.ejs");
  return res.send("Express TS on Vercel");
};

const handlePushTelegramNotificationController = async (
  req: any,
  _res?: any
) => {
  try {
    await telegramService.sendNotification(req.body);
    return;
  } catch (error) {
    console.log("error :", error?.message);
  }
};

const handlePushPhotoTelegramNotificationController = async (
  req: any,
  res?: any
) => {
  try {
    await telegramService.sendPhoto(req.body, req.img);
    console.log("send :", req.body);
    return res?.redirect("/telegram");
  } catch (error) {
    console.log("error :", error?.message);
  }
};

const getTelegramPage = (req: any, res: any) => {
  return res.render("telegram.ejs");
};

const sendAnimation = async (req: any, res: any) => {
  await telegramService.sendMeAGif();
  return res.redirect("/");
};

export {
  getHomePage,
  getTelegramPage,
  sendAnimation,
  handlePushTelegramNotificationController,
  handlePushPhotoTelegramNotificationController,
};
