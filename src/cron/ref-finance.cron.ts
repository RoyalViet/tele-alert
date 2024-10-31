import { CronJob } from "cron";
import { delay } from "../common/helper/common.helper";
import { getAllPools } from "../controllers/ref-finance/ref-finance.controller";

const cronExpression15s = "*/15 * * * * *";
const cronExpression10s = "*/10 * * * * *";
export const checkRefPoolToken = new CronJob(cronExpression15s, async () => {
  await delay(Math.random() * 1500);
  getAllPools();
});
