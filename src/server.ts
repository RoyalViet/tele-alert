require("dotenv").config();
import "module-alias/register";

import app from "./configs/express.config";
import logger from "./configs/logger.config";
import { checkReleasePoolToken } from "./cron/cronTask";
import connectDB from "./database/db.mysql";

const PORT = process.env.PORT || 8000;

const main = async () => {
  // connectDB
  // await connectDB();

  // cron job
  // job.start();
  checkReleasePoolToken.start();

  // test
  // testF()

  app.listen(PORT, () => {
    logger.info(`Server running at ${PORT}`);
  });
};

main();
