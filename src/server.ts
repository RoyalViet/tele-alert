require("dotenv").config();
import "module-alias/register";

import app from "./configs/express.config";
import logger from "./configs/logger.config";
// import { checkMemeCooking, checkReleasePoolToken } from "./cron/cronTask";
// import connectDB from "./database/db.mysql";
import { checkReleasePoolToken } from "./cron/pool-token.cron";
import {
  checkMemeCooking,
  fetchMemeTrades,
  getMemeTradesCron,
} from "./cron/meme-cook.cron";
import { checkRefPoolToken } from "./cron/ref-finance.cron";
import { testF } from "./test";
import { checkRadiumPoolToken } from "./cron/raydium.cron";
import { getAllPools, getPools } from "./controllers/raydium/raydium";
import { sendAnimation } from "./controllers/common/homepageController";
import { sendNotification } from "./services/telegram/telegramService";

const PORT = process.env.PORT || 8000;

const main = async () => {
  // connectDB
  // await connectDB();

  // getMemeTradesCron(390, { isSortDown: true });
  // const gethMemeTrades = getMemeTradesCron(961);
  // gethMemeTrades.start();

  // cron job
  // job.start();

  // TODO: run
  checkMemeCooking.start();
  checkRefPoolToken.start();
  // checkRadiumPoolToken.start();

  // checkReleasePoolToken.start();

  // getPools({});
  // getAllPools({});

  // test
  // testF();

  app.listen(PORT, () => {
    logger.info(`Server running at ${PORT}`);
  });
};

main();
