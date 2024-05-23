import express from "express";

// Controller
import userController from "../../controllers/user/user.controller";

// Schema
import userSchema from "../../validations/schemas/user.schema";
import schemaValidator from "../../middlewares/schema-validator.middleware";

const meRouter = express.Router();

meRouter.get("/", userController.me);

meRouter.put(
  "/",
  schemaValidator(userSchema.updateMe.body),
  userController.updateMe
);

export default meRouter;
