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
  checkTxn.start();
  // checkRadiumPoolToken.start();

  // test
  // testF();

  app.listen(PORT, () => {
    logger.info(`Server running at ${PORT}`);
  });
};

main();
