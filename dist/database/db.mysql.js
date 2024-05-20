"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const db_mysql_config_1 = require("./db.mysql.config");
// Create a connection to the database
const connection = mysql2_1.default.createConnection({
    host: db_mysql_config_1.MySQL_DB.HOST,
    user: db_mysql_config_1.MySQL_DB.USER,
    password: db_mysql_config_1.MySQL_DB.PASSWORD,
    database: db_mysql_config_1.MySQL_DB.DB,
});
// open the MySQL connection
connection.connect((error) => {
    if (error)
        throw error;
    console.log("Successfully connected to the database.");
});
exports.default = connection;
//# sourceMappingURL=db.mysql.js.map