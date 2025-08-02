import { CronJob } from "cron";
import { delay } from "../common/helper/common.helper";
import { getPools } from "../controllers/raydium/raydium";

const cronExpression50s = "*/50 * * * * *";
const cronExpression15s = "*/15 * * * * *";
const cronExpression10s = "*/10 * * * * *";

const cronExpression5m = "*/5 * * * *";
const cronExpression3m = "*/3 * * * *";
const cronExpression1m = "* * * * *";

export const checkRadiumPoolToken = new CronJob(cronExpression3m, async () => {
  await delay(Math.random() * 1500);
  getPools({});
});
