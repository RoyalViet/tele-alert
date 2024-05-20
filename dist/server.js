"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const viewEngine_1 = __importDefault(require("./config/viewEngine"));
const web_1 = __importDefault(require("./routes/web"));
const cronTask_1 = require("./cron/cronTask");
const app = (0, express_1.default)();
//config body-parser to post data to server
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
//config view Engine
(0, viewEngine_1.default)(app);
//init all web routes
(0, web_1.default)(app);
// cron job
// job.start();
cronTask_1.checkReleasePoolToken.start();
// test
// main();
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`App is running at the port ${port}`);
});
//# sourceMappingURL=server.js.map