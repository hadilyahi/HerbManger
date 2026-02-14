import { pool } from "@/lib/db";

export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  created_at: string;
}

export async function getAllSuppliers(): Promise<Supplier[]> {
  const [rows] = await pool.query(
    "SELECT id, name, phone, created_at FROM suppliers"
  );
  return rows as Supplier[];
}

export async function createSupplier(name: string, phone?: string) {
  await pool.query(
    "INSERT INTO suppliers (name, phone) VALUES (?, ?)",
    [name, phone || null]
  );
}

export async function updateSupplier(id: number, name: string, phone?: string) {
  await pool.query(
    "UPDATE suppliers SET name=?, phone=? WHERE id=?",
    [name, phone || null, id]
  );
}

export async function deleteSupplier(id: number) {
  await pool.query("DELETE FROM suppliers WHERE id=?", [id]);
}
