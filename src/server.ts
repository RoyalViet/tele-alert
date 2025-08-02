require("dotenv").config();
<<<<<<< HEAD
import express from "express";
import bodyParser from "body-parser";

const app = express();
=======
import "module-alias/register";

import app from "./configs/express.config";
import logger from "./configs/logger.config";
// import {
//   checkMemeCooking,
//   fetchMemeTrades,
//   getMemeTradesCron,
// } from "./cron/meme-cook.cron";
// import { checkTxn } from "./cron/pool-token.cron";
// import { checkRefPoolToken } from "./cron/ref-finance.cron";
// import { checkMitteToken } from "./cron/mitte.cron";
// import { sendMeAGif } from "./services/telegram/telegramService";
import { startAllCronJobs } from "./cron/index";
>>>>>>> develop

const PORT = process.env.PORT || 8000;

<<<<<<< HEAD
//config view Engine

//init all web routes

let port = process.env.PORT || 8080;
=======
const main = async () => {
  // connectDB
  // await connectDB();

  // getMemeTradesCron(390, { isSortDown: true });
  // const id = 1517;
  // fetchMemeTrades(id);
  // const gethMemeTrades = getMemeTradesCron(id);
  // gethMemeTrades.start();

  // TODO: run
  // checkMemeCooking.start();
  // checkRefPoolToken.start();
  // checkTxn.start();
  // checkMitteToken.start();
  // checkRadiumPoolToken.start();

  // Start Pikespeak SWAP monitor
  startAllCronJobs();
>>>>>>> develop

  // sendMeAGif();

  // test
  // testF();

  app.listen(PORT, () => {
    logger.info(`Server running at ${PORT}`);
  });
};

main();
