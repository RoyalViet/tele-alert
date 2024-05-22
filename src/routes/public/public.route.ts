import express from "express";

const publicRouter = express.Router();

publicRouter.get("/public", (req, res) => {
  res.json({ message: "Public router" });
});

export default publicRouter;
