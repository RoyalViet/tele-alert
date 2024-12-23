require("dotenv").config();
import "module-alias/register";

import app from "./configs/express.config";
import logger from "./configs/logger.config";
import {
  checkMemeCooking,
  fetchMemeTrades,
  getMemeTradesCron,
} from "./cron/meme-cook.cron";
import { checkTxn } from "./cron/pool-token.cron";
import { checkRefPoolToken } from "./cron/ref-finance.cron";
import { checkMitteToken } from "./cron/mitte.cron";
import { sendMeAGif } from "./services/telegram/telegramService";

const PORT = process.env.PORT || 8000;

const main = async () => {
  // connectDB
  // await connectDB();

  // getMemeTradesCron(390, { isSortDown: true });
  // const id = 1207;
  // fetchMemeTrades(id);
  // const gethMemeTrades = getMemeTradesCron(id);
  // gethMemeTrades.start();

  // TODO: run
  checkMemeCooking.start();
  checkRefPoolToken.start();
  checkMitteToken.start();
  checkTxn.start();
  // checkRadiumPoolToken.start();

  // sendMeAGif();

  // test
  // testF();

  app.listen(PORT, () => {
    logger.info(`Server running at ${PORT}`);
  });
};

main();
