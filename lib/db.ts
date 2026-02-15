import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "turntable.proxy.rlwy.net",
  port: 34864,
  user: "root",
  password: "ugIgXELaSWwdmkEjiGbQKxLIcSXKMxQJ",
  database: "herb_manager",
  waitForConnections: true,
  connectionLimit: 10,
});
