import { pool } from "@/lib/db";

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  created_at: string;
}

// جلب كل المنتجات
export async function getAllProducts(): Promise<Product[]> {
  const [rows] = await pool.query(
    `SELECT p.id, p.name, p.category_id as categoryId, p.created_at
     FROM products p`
  );
  return rows as Product[];
}

// إنشاء منتج جديد
export async function createProduct(name: string, categoryId: number, unit: string) {
  await pool.query(
    "INSERT INTO products (name, category_id) VALUES (?, ?)",
    [name, categoryId]
  );
} 
export async function updateProduct(
  id: number,
  name: string,
  categoryId: number
) {
  await pool.query(
    "UPDATE products SET name = ?, category_id = ? WHERE id = ?",
    [name, categoryId, id]
  );
}
// حذف منتج
export async function deleteProduct(id: number) {
  await pool.query("DELETE FROM products WHERE id = ?", [id]);
}


