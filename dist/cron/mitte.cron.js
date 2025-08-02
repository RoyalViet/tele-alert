"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkMitteToken = void 0;
const cron_1 = require("cron");
const common_helper_1 = require("../common/helper/common.helper");
const mitte_controller_1 = require("../controllers/mitte/mitte.controller");
const cronExpression50s = "*/50 * * * * *";
const cronExpression15s = "*/15 * * * * *";
const cronExpression10s = "*/10 * * * * *";
const cronExpression5m = "*/5 * * * *";
const cronExpression3m = "*/3 * * * *";
const cronExpression1m = "* * * * *";
exports.checkMitteToken = new cron_1.CronJob(cronExpression50s, async () => {
    await (0, common_helper_1.delay)(Math.random() * 1500);
    console.log(`v2 running cron job checkMitteToken...`);
    (0, mitte_controller_1.crawlCoins)();
});
//# sourceMappingURL=mitte.cron.js.map