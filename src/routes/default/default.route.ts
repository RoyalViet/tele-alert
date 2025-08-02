import express from "express";

const defaultRouter = express.Router();

defaultRouter.get("/", (req, res) => {
  res.json({ message: "ExpressJS, Typescript, TypeORM, MySQL" });
});

export default defaultRouter;
