import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "localhost",
  user: "root",       
  password: "hadil2417", 
  database: "herb_manager",
  waitForConnections: true,
  connectionLimit: 10,
});
