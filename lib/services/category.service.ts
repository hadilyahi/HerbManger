import { pool } from "@/lib/db";

export async function getAllCategories() {
  const [rows] = await pool.query("SELECT * FROM categories ORDER BY name ASC");
  return rows;
}

export async function createCategory(name: string) {
  await pool.query("INSERT INTO categories (name) VALUES (?)", [name]);
}

export async function deleteCategory(id: number) {
  await pool.query("DELETE FROM categories WHERE id = ?", [id]);
}
