import { pool } from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

export interface StockItem extends RowDataPacket {
  product_id: number;
  product_name: string;
  quantity: number;
}

export async function getAllStock() {
  const [rows] = await pool.query<StockItem[]>(`
    SELECT
      p.id AS product_id,
      p.name AS product_name,
      ws.quantity
    FROM products p
    INNER JOIN warehouse_stock ws
      ON p.id = ws.product_id
    ORDER BY p.name
  `);

  return rows;
}

export async function addStock(productId: number, quantity: number) {
  await pool.query(`
    INSERT INTO warehouse_stock (product_id, quantity)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE
    quantity = quantity + VALUES(quantity)
  `, [productId, quantity]);

  return true;
}
export async function updateStock(
  productId: number,
  quantity: number
) {
  await pool.query(
    `
    UPDATE warehouse_stock
    SET quantity = ?
    WHERE product_id = ?
    `,
    [quantity, productId]
  );

  return true;
}

export async function deleteStock(
  productId: number
) {
  await pool.query(
    `
    DELETE FROM warehouse_stock
    WHERE product_id = ?
    `,
    [productId]
  );

  return true;
}