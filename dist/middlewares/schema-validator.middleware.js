"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supportedMethods = ["post", "put", "patch", "delete"];
const validationOptions = {
    abortEarly: false,
    allowUnknown: false,
    stripUnknown: false,
};
const schemaValidator = (schema, useJoiError = true) => {
    if (!schema) {
        throw new Error(`Schema not found`);
    }
    return (req, res, next) => {
        const method = req.method.toLowerCase();
        if (!supportedMethods.includes(method)) {
            return next();
        }
        const { error, value } = schema.validate(req.body, validationOptions);
        if (error) {
            const customError = {
                status: "failed",
                error: "Invalid request. Please review request and try again.",
            };
            const joiError = {
                status: "failed",
                error: {
                    original: error._original,
                    details: error.details.map(({ message, type }) => ({
                        message: message.replace(/['"]/g, ""),
                        type,
                    })),
                },
            };
            return res.status(422).json(useJoiError ? joiError : customError);
        }
        // validation successful
        req.body = value;
        return next();
    };
};
exports.default = schemaValidator;
//# sourceMappingURL=schema-validator.middleware.js.map