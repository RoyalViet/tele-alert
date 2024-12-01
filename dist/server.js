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
const pool_token_cron_1 = require("./cron/pool-token.cron");
const ref_finance_cron_1 = require("./cron/ref-finance.cron");
const PORT = process.env.PORT || 8000;
const main = async () => {
    // connectDB
    // await connectDB();
    // getMemeTradesCron(390, { isSortDown: true });
    // const gethMemeTrades = getMemeTradesCron(1114);
    // gethMemeTrades.start();
    // TODO: run
    meme_cook_cron_1.checkMemeCooking.start();
    ref_finance_cron_1.checkRefPoolToken.start();
    pool_token_cron_1.checkTxn.start();
    // checkRadiumPoolToken.start();
    // test
    // testF();
    express_config_1.default.listen(PORT, () => {
        logger_config_1.default.info(`Server running at ${PORT}`);
    });
};
main();
//# sourceMappingURL=server.js.map