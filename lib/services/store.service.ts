
import { query } from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";

export interface Store {
  id: number;
  name: string;
  phone: string;
  address: string;
  previous_balance: number;
  current_balance: number;
  notes: string;
}

export interface CreateStoreInput {
  name: string;
  phone?: string;
  address?: string;
  previous_balance?: number;
  notes?: string;
}

// جميع المحلات
export async function getStores(): Promise<Store[]> {
  return await query<Store[]>(
    `SELECT *
     FROM stores
     ORDER BY id DESC`
  );
}

// محل واحد
export async function getStoreById(id: number): Promise<Store | null> {
  const rows = await query<RowDataPacket[]>(
    `SELECT *
     FROM stores
     WHERE id = ?`,
    [id]
  );

  if (rows.length === 0) return null;

  return rows[0] as Store;
}

// إضافة محل
export async function createStore(data: CreateStoreInput) {
  const result = await query<ResultSetHeader>(
    `
    INSERT INTO stores
    (
      name,
      phone,
      address,
      previous_balance,
      current_balance,
      notes
    )
    VALUES
    (?, ?, ?, ?, ?, ?)
    `,
    [
      data.name,
      data.phone || "",
      data.address || "",
      data.previous_balance || 0,
      data.previous_balance || 0,
      data.notes || "",
    ]
  );

  return result.insertId;
}



export async function getStoreInvoices(storeId: number) {
  return query(
    `
    SELECT
      id,
      invoice_number,
      invoice_date,
      total,
      paid,
      remaining,
      status
    FROM store_invoices
    WHERE store_id = ?
    ORDER BY id DESC
    `,
    [storeId]
  );
}

export async function getStoreProducts(storeId: number) {
  return query(
    `
    SELECT
      sii.product_id,
      p.name AS product_name,
      SUM(sii.quantity) AS quantity,
      MAX(sii.selling_price) AS selling_price
    FROM store_invoice_items sii
    INNER JOIN products p
      ON p.id = sii.product_id
    INNER JOIN store_invoices si
      ON si.id = sii.invoice_id
    WHERE si.store_id = ?
    GROUP BY sii.product_id, p.name
    ORDER BY p.name
    `,
    [storeId]
  );
}