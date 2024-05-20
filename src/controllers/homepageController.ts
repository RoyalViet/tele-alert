import * as telegramService from "../services/telegramService";

const getHomePage = (req: any, res: any) => {
  return res.render("homepage.ejs");
};

// const handlePushTelegramNotification = async (req: any, res?: any) => {
const handlePushTelegramNotification = async (req: any, res?: any) => {
  //send notification to telegram

  // const msg = `Fullname: <b>${user.fullName}</b>
  //       Description: <i>${user.description}</i>
  // `;

  await telegramService.sendNotification(req.body);
  //then redirect to the telegram page
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
  handlePushTelegramNotification,
  getTelegramPage,
  sendAnimation,
};
