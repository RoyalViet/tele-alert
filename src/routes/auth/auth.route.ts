import express from "express";

// Controller
import userController from "../../controllers/user/user.controller";

// Schema
import userSchema from "../../validations/schemas/user.schema";
import schemaValidator from "../../middlewares/schema-validator.middleware";

const authRouter = express.Router();

authRouter.post(
  "/register",
  schemaValidator(userSchema.register.body),
  userController.create
);

authRouter.post(
  "/login",
  schemaValidator(userSchema.login.body),
  userController.login
);

export default authRouter;
