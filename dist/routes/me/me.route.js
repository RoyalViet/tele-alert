"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// Controller
const user_controller_1 = __importDefault(require("../../controllers/user/user.controller"));
// Schema
const user_schema_1 = __importDefault(require("../../validations/schemas/user.schema"));
const schema_validator_middleware_1 = __importDefault(require("../../middlewares/schema-validator.middleware"));
const meRouter = express_1.default.Router();
meRouter.get("/", user_controller_1.default.me);
meRouter.put("/", (0, schema_validator_middleware_1.default)(user_schema_1.default.updateMe.body), user_controller_1.default.updateMe);
exports.default = meRouter;
//# sourceMappingURL=me.route.js.map