import express from "express";

// Controller
import userController from "../../controllers/user/user.controller";

// Schema
// import userSchema from "../../validations/schemas/user.schema";

// Middleware
import { isAdmin } from "../../middlewares/permission-handler.middleware";

const userRouter = express.Router();

userRouter.get("/", userController.list);

userRouter.delete("/:id", isAdmin(), userController.remove);

export default userRouter;
