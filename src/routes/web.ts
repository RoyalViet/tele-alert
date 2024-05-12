import express from "express";
import * as homepageController from "../controllers/homepageController";

const router = express.Router();

const initAllWebRoutes = (app: any) => {
  router.get("/", homepageController.getHomePage);
  router.post(
    "/send-notification",
    homepageController.handlePushTelegramNotification
  );
  router.get("/telegram", homepageController.getTelegramPage);
  router.get("/send-animation", homepageController.sendAnimation);
  return app.use("/", router);
};

export default initAllWebRoutes;
