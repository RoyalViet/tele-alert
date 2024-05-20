import axios from "axios";

require("dotenv").config();

const sendNotification = (msg: any) => {
  return new Promise((resolve, reject) => {
    try {
      let TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
      let TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;

      let data = {
        chat_id: TELEGRAM_GROUP_ID,
        parse_mode: "HTML",
        text: msg,
      };

      axios
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
    } catch (e) {
      reject(e);
    }
  });
};

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

      axios
        .post(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendAnimation`,
          data
        )
        .then(() => {
          resolve("done!");
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    } catch (e) {
      reject(e);
    }
  });
};

export { sendNotification, sendMeAGif };
