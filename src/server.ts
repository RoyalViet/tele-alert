require("dotenv").config();
import express from "express";
import bodyParser from "body-parser";
import configViewEngine from "./config/viewEngine";
import initAllWebRoutes from "./routes/web";
import { job } from "./cron/cronTask";

let app = express();

//config body-parser to post data to server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//config view Engine
configViewEngine(app);

//init all web routes
initAllWebRoutes(app);

// cron job
job.start();

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`App is running at the port ${port}`);
});
