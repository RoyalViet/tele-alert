"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const defaultRouter = express_1.default.Router();
defaultRouter.get("/", (req, res) => {
    res.json({ message: "ExpressJS, Typescript, TypeORM, MySQL" });
});
exports.default = defaultRouter;
//# sourceMappingURL=default.route.js.map