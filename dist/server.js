"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
require("module-alias/register");
const express_config_1 = __importDefault(require("./configs/express.config"));
const logger_config_1 = __importDefault(require("./configs/logger.config"));
const meme_cook_cron_1 = require("./cron/meme-cook.cron");
const ref_finance_cron_1 = require("./cron/ref-finance.cron");
const PORT = process.env.PORT || 8000;
const main = async () => {
    // connectDB
    // await connectDB();
    // fetchMemeTrades(711);
    // fetchMemeTrades(390, { isSortDown: true });
    // cron job
    // job.start();
    // TODO: run
    meme_cook_cron_1.checkMemeCooking.start();
    ref_finance_cron_1.checkRefPoolToken.start();
    // checkRadiumPoolToken.start();
    // checkReleasePoolToken.start();
    // getPools({});
    // getAllPools({});
    // test
    // testF();
    express_config_1.default.listen(PORT, () => {
        logger_config_1.default.info(`Server running at ${PORT}`);
    });
};
main();
//# sourceMappingURL=server.js.map