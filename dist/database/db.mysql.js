"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const logger_config_1 = __importDefault(require("../configs/logger.config"));
const typeorm_1 = require("typeorm");
// Create a connection to the database
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // const AppDataSource = new DataSource({
        //   type: "mysql",
        //   host: process.env.DB_HOST || "127.0.0.1",
        //   username: process.env.DB_USER || "root",
        //   password: process.env.DB_PASSWORD || "",
        //   database: process.env.DB_NAME || "telegram-alerts",
        //   port: Number(process.env.DB_PORT) || 3306,
        //   charset: "utf8",
        //   // driver: "mysql",
        //   synchronize: false,
        //   entities:
        //     process.env.NODE_ENV !== "production"
        //       ? ["**/**.entity.ts"]
        //       : ["dist/**/*.entity.js"],
        //   logging: process.env.NODE_ENV !== "production" ? "all" : ["error"],
        //   migrations:
        //     process.env.NODE_ENV !== "production"
        //       ? ["src/migrations/*.ts"]
        //       : ["dist/migrations/*.js"],
        //   // cli: {
        //   //   migrationsDir: "src/migrations",
        //   // },
        //   connectTimeout: 30000,
        //   acquireTimeout: 30000,
        // });
        // AppDataSource.initialize().then(() => {
        //   logger.info("Connect to database successfully");
        // });
        const connection = yield (0, typeorm_1.createConnection)(); // Connect to the DB that is setup in the ormconfig.js
        yield connection.runMigrations(); // Run all migrations
        logger_config_1.default.info("Connect to database successfully");
    }
    catch (e) {
        logger_config_1.default.info(`The connection to database was failed with error: ${e}`);
    }
});
exports.default = connectDB;
//# sourceMappingURL=db.mysql.js.map