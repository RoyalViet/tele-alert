require("dotenv").config();
import "module-alias/register";

import app from "./configs/express.config";
import logger from "./configs/logger.config";
// import { checkMemeCooking, checkReleasePoolToken } from "./cron/cronTask";
// import connectDB from "./database/db.mysql";
import { checkReleasePoolToken } from "./cron/pool-token.cron";
import { checkMemeCooking, fetchMemeTrades } from "./cron/meme-cook.cron";
import { checkRefPoolToken } from "./cron/ref-finance.cron";
import { testF } from "./test";

const PORT = process.env.PORT || 8000;

const main = async () => {
  // connectDB
  // await connectDB();

  // fetchMemeTrades(366);
  // fetchMemeTrades(339, { isSortDown: true });

  // cron job
  // job.start();
  checkMemeCooking.start();
  checkRefPoolToken.start();
  // checkReleasePoolToken.start();

  // test
  // testF();

  app.listen(PORT, () => {
    logger.info(`Server running at ${PORT}`);
  });
};

main();
