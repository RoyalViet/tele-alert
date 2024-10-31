"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRefPoolToken = void 0;
const cron_1 = require("cron");
const common_helper_1 = require("../common/helper/common.helper");
const ref_finance_controller_1 = require("../controllers/ref-finance/ref-finance.controller");
const cronExpression15s = "*/15 * * * * *";
const cronExpression10s = "*/10 * * * * *";
exports.checkRefPoolToken = new cron_1.CronJob(cronExpression15s, async () => {
    await (0, common_helper_1.delay)(Math.random() * 1500);
    (0, ref_finance_controller_1.getAllPools)();
});
//# sourceMappingURL=ref-finance.cron.js.map