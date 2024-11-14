import { CronJob } from "cron";
import { delay } from "../common/helper/common.helper";
import { getPools } from "../controllers/raydium/raydium";

const cronExpression50s = "*/50 * * * * *";
const cronExpression15s = "*/15 * * * * *";
const cronExpression10s = "*/10 * * * * *";

// const cronExpression5m = "*/5 * * * *";
export const checkRadiumPoolToken = new CronJob(cronExpression50s, async () => {
  await delay(Math.random() * 1500);
  getPools({});
});
