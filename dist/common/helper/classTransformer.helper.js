"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plainToClass = plainToClass;
const class_transformer_1 = require("class-transformer");
// eslint-disable-next-line no-redeclare
function plainToClass(cls, plain, options) {
    return (0, class_transformer_1.plainToClass)(cls, plain, { excludeExtraneousValues: true, ...options });
}
//# sourceMappingURL=classTransformer.helper.js.map