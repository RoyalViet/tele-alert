import axios from "axios";

// const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const TELEGRAM_GROUP_ID = process.env.TELEGRAM_GROUP_ID;
const TELEGRAM_BOT_TOKEN = "6893137130:AAG7kto4ZePK8Z-SrS1dgUt8BfHeinhkA3A";
const TELEGRAM_GROUP_ID = "1177623428";
const TELEGRAM_BOT_TOKEN_ON_SOL =
  "7312207574:AAHeqwYRKSSdSSlgLceFN9CiwkSFm7urR0c";

const sendNotification = (
  msg: any,
  options?: Partial<{ isGenerateTelegramMarkdown: boolean; isSol: boolean }>
) => {
  return new Promise((resolve, reject) => {
    try {
      console.log("send :", msg);

      let data = {
        chat_id: TELEGRAM_GROUP_ID,
        parse_mode: !options?.isGenerateTelegramMarkdown ? "HTML" : "Markdown",
        text: msg,
      };

      axios
        .get(
          `https://api.telegram.org/bot${
            options?.isSol ? TELEGRAM_BOT_TOKEN_ON_SOL : TELEGRAM_BOT_TOKEN
          }/sendMessage`,
          {
            params: data,
          }
        )
        .then(() => {
          console.log("done!");
          resolve("done!");
        })
        .catch((err) => {
          console.log("err send msg:", err?.message);
          reject(err);
        });
    } catch (e) {
      reject(e);
    }
  });
};

const sendMeAGif = () => {
  console.log("run sendMeAGif");
  return new Promise((resolve, reject) => {
    try {
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
          console.log("sendMeAGif done");
          resolve("done!");
        })
        .catch((err) => {
          console.log("err sendMeAGif :", err);
          // reject(err);
          resolve("err done!");
        });
    } catch (e) {
      console.log("e sendMeAGif :", e);
      // reject(e);
      resolve("err done!");
    }
  });
};

const sendPhoto = (
  msg: any,
  imageUrl: string,
  options?: Partial<{ isGenerateTelegramMarkdown: boolean }>
) => {
  return new Promise((resolve, reject) => {
    try {
      let data = {
        chat_id: TELEGRAM_GROUP_ID,
        parse_mode: !options?.isGenerateTelegramMarkdown ? "HTML" : "Markdown",
        photo: imageUrl,
        caption: msg,
      };

      axios
        .post(
          `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
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

export { sendNotification, sendMeAGif, sendPhoto };
