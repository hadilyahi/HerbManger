import { pool } from "@/lib/db";
import { InvoiceData, CreatedInvoiceResult,InsertResult } from "@/types/invoice";
import mysql from "mysql2/promise";


export async function createInvoice(data: InvoiceData): Promise<CreatedInvoiceResult> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query<mysql.ResultSetHeader>(
    "INSERT INTO invoices (supplier_id, invoice_date, paid_amount) VALUES (?, ?, ?)",
    [data.supplierId, data.invoiceDate, data.paidAmount]
    );

    const invoiceId = result.insertId;


    let totalAmount = 0;

    for (const item of data.items) {
      const totalCost = item.quantity * item.purchasePrice;
      totalAmount += totalCost;

      await connection.query(
        `INSERT INTO invoice_items
        (invoice_id, product_id, quantity, purchase_price, selling_price, total_cost)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [invoiceId, item.productId, item.quantity, item.purchasePrice, item.sellingPrice, totalCost]
      );
    }

    const remaining = totalAmount - data.paidAmount;

    await connection.query(
      "UPDATE invoices SET total_amount=?, remaining=? WHERE id=?",
      [totalAmount, remaining, invoiceId]
    );

    await connection.commit();
    return { invoiceId, totalAmount, remaining };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
import { RowDataPacket } from "mysql2/promise";
// إضافة في أسفل invoice.service.ts



interface InvoiceRow {
  id: number;
  invoice_date: string;
  total_amount: number;
  paid_amount: number;
  remaining: number;
  supplier_name: string;
}

// في /lib/services/invoice.service.ts


export interface Invoice {
  id: number;
  invoice_date: string;
  total_amount: number;
  paid_amount: number;
  remaining: number;
  supplier_name: string;
  items_count: number;
}

export async function getAllInvoices(): Promise<Invoice[]> {
  const [rows] = await pool.query<RowDataPacket[]>(`
    SELECT 
      i.id,
      i.invoice_date,
      i.total_amount,
      i.paid_amount,
      i.remaining,
      s.name AS supplier_name,
      COUNT(ii.id) AS items_count
    FROM invoices i
    JOIN suppliers s ON i.supplier_id = s.id
    LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
    GROUP BY i.id, i.invoice_date, i.total_amount, i.paid_amount, i.remaining, s.name
    ORDER BY i.invoice_date DESC
  `);

  // تحويل RowDataPacket[] إلى Invoice[] صريح
  return (rows as RowDataPacket[]).map(row => ({
    id: Number(row.id),
    invoice_date: String(row.invoice_date),
    total_amount: Number(row.total_amount),
    paid_amount: Number(row.paid_amount),
    remaining: Number(row.remaining),
    supplier_name: String(row.supplier_name),
    items_count: Number(row.items_count),
  }));
}

export async function updateInvoicePaidAmount(
  invoiceId: number,
  paidAmount: number
) {
  await pool.query(
    `
    UPDATE invoices
    SET paid_amount = ?, remaining = total_amount - ?
    WHERE id = ?
    `,
    [paidAmount, paidAmount, invoiceId]
  );
}
export async function deleteInvoice(invoiceId: number) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // حذف عناصر الفاتورة أولاً
    await connection.query(
      "DELETE FROM invoice_items WHERE invoice_id = ?",
      [invoiceId]
    );

    // حذف الفاتورة نفسها
    await connection.query(
      "DELETE FROM invoices WHERE id = ?",
      [invoiceId]
    );

    await connection.commit();
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

// جلب فاتورة واحدة حسب الـ ID
export async function getInvoiceById(invoiceId: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      i.id,
      i.invoice_date,
      i.total_amount,
      i.paid_amount,
      i.remaining,
      s.name AS supplier_name,
      COUNT(ii.id) AS items_count
    FROM invoices i
    JOIN suppliers s ON i.supplier_id = s.id
    LEFT JOIN invoice_items ii ON ii.invoice_id = i.id
    WHERE i.id = ?
    GROUP BY i.id, i.invoice_date, i.total_amount, i.paid_amount, i.remaining, s.name
    `,
    [invoiceId]
  );

  if (!rows || rows.length === 0) {
    throw new Error("الفاتورة غير موجودة");
  }

  const row = rows[0];
  return {
    id: Number(row.id),
    invoice_date: String(row.invoice_date),
    total_amount: Number(row.total_amount),
    paid_amount: Number(row.paid_amount),
    remaining: Number(row.remaining),
    supplier_name: String(row.supplier_name),
    items_count: Number(row.items_count),
  };
}
