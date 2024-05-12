import { CronJob } from "cron";

const job = new CronJob("*/10 * * * * *", () => {
  // Tác vụ log message
  console.log("Đây là một log message.");
});

export { job };
