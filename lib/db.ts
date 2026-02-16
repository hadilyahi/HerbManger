import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "turntable.proxy.rlwy.net",
  port: 31088,
  user: "root",
  password: "qTEwzdfsynanQWnbSytITCgYgzIBhjDU",
  database: "herb_manager",
  waitForConnections: true,
  connectionLimit: 10,
});
export type RowDataPacket = { [key: string]: string | number | null };

// دالة استعلام عامة
export async function query<T = RowDataPacket[]>(
  sql: string,
  params: (string | number)[] = []
): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}