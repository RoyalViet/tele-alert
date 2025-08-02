import { CronJob } from "cron";
import { delay } from "../common/helper/common.helper";
import { crawlCoins } from "../controllers/mitte/mitte.controller";

const cronExpression50s = "*/50 * * * * *";
const cronExpression15s = "*/15 * * * * *";
const cronExpression10s = "*/10 * * * * *";

const cronExpression5m = "*/5 * * * *";
const cronExpression3m = "*/3 * * * *";
const cronExpression1m = "* * * * *";

export const checkMitteToken = new CronJob(cronExpression50s, async () => {
  await delay(Math.random() * 1500);
  console.log(`v2 running cron job checkMitteToken...`);
  crawlCoins();
});
