"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const publicRouter = express_1.default.Router();
publicRouter.get("/public", (req, res) => {
    res.json({ message: "Public router" });
});
exports.default = publicRouter;
//# sourceMappingURL=public.route.js.map