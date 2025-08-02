"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const configViewEngine = (app) => {
    app.use(express_1.default.static("./src/public"));
    app.set("view engine", "ejs");
    app.set("views", "./src/views");
};
exports.default = configViewEngine;
//# sourceMappingURL=viewEngine.js.map