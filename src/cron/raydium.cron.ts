import { CronJob } from "cron";
import { delay } from "../common/helper/common.helper";
import { getPools } from "../controllers/raydium/raydium";

const cronExpression15s = "*/15 * * * * *";
const cronExpression10s = "*/10 * * * * *";
export const checkRefPoolToken = new CronJob(cronExpression15s, async () => {
  await delay(Math.random() * 1500);
  getPools({});
});
