"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.job = void 0;
const cron_1 = require("cron");
const job = new cron_1.CronJob("*/10 * * * * *", () => {
    // Tác vụ log message
    console.log("Đây là một log message.");
});
exports.job = job;
//# sourceMappingURL=cronTask.js.map