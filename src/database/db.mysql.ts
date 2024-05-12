import mysql from "mysql2";
import { MySQL_DB } from "./db.mysql.config";

// Create a connection to the database
const connection = mysql.createConnection({
  host: MySQL_DB.HOST,
  user: MySQL_DB.USER,
  password: MySQL_DB.PASSWORD,
  database: MySQL_DB.DB,
});

// open the MySQL connection
connection.connect((error) => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

export default connection;
