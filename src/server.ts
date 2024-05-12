require("dotenv").config();
import express from "express";
import bodyParser from "body-parser";

const app = express();

//config body-parser to post data to server
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//config view Engine

//init all web routes

let port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`App is running at the port ${port}`);
});
