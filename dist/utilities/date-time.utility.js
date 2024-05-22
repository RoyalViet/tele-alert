"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
class DateTimeUtility {
    static getCurrentTimeStamp() {
        return (0, moment_1.default)(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    }
}
exports.default = DateTimeUtility;
//# sourceMappingURL=date-time.utility.js.map