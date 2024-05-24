import * as telegramService from "../../services/telegram/telegramService";

const getHomePage = (req: any, res: any) => {
  // return res.render("homepage.ejs");
  return res.send("Express TS on Vercel");
};

// const handlePushTelegramNotificationController = async (req: any, res?: any) => {
const handlePushTelegramNotificationController = async (
  req: any,
  res?: any
) => {
  await telegramService.sendNotification(req.body);
  return res?.redirect("/telegram");
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
  handlePushTelegramNotificationController,
  getTelegramPage,
  sendAnimation,
};
