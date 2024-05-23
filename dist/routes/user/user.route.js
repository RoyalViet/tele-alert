"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Controller
const user_controller_1 = __importDefault(require("../../controllers/user/user.controller"));
// Schema
// import userSchema from "../../validations/schemas/user.schema";
// Middleware
const permission_handler_middleware_1 = require("../../middlewares/permission-handler.middleware");
const userRouter = express_1.default.Router();
userRouter.get("/", user_controller_1.default.list);
userRouter.delete("/:id", (0, permission_handler_middleware_1.isAdmin)(), user_controller_1.default.remove);
exports.default = userRouter;
//# sourceMappingURL=user.route.js.map