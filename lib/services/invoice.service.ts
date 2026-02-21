import { pool } from "@/lib/db";
import { InvoiceData, CreatedInvoiceResult } from "@/types/invoice";
import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";

// إنشاء فاتورة جديدة
export async function createInvoice(data: InvoiceData): Promise<CreatedInvoiceResult> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query<ResultSetHeader>(
      "INSERT INTO invoices (supplier_id, invoice_date, paid_amount) VALUES (?, ?, ?)",
      [data.supplierId, data.invoiceDate, data.paidAmount]
    );

    const invoiceId = result.insertId;
    let totalAmount = 0;

    for (const item of data.items) {
      const totalCost = item.quantity * item.purchasePrice;
      totalAmount += totalCost;

      await connection.query<ResultSetHeader>(
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

// تحديث فاتورة بالكامل
export interface InvoiceItemUpdate {
  id?: number;           // موجود إذا كان العنصر موجود مسبقًا، undefined إذا جديد
  productId?: number;    // مطلوب فقط للعناصر الجديدة
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

export interface InvoiceFullUpdate {
  supplierId: number;
  paidAmount: number;
  invoiceDate: string;
  items: InvoiceItemUpdate[];
}

export interface Invoice {
  id: number;
  invoice_date: string;
  total_amount: number;
  paid_amount: number;
  remaining: number;
  supplier_name: string;
  items_count: number;
}

// جلب جميع الفواتير
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

// حذف فاتورة
export async function deleteInvoice(invoiceId: number) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      "DELETE FROM invoice_items WHERE invoice_id = ?",
      [invoiceId]
    );

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

// جلب فاتورة واحدة
export async function getInvoiceById(invoiceId: number) {
  const [invoiceRows] = await pool.query<RowDataPacket[]>(
    `
    SELECT 
      i.id,
      i.supplier_id,
      i.invoice_date,
      i.paid_amount
    FROM invoices i
    WHERE i.id = ?
    `,
    [invoiceId]
  );

  if (invoiceRows.length === 0) {
    throw new Error("الفاتورة غير موجودة");
  }

  const invoice = invoiceRows[0];

  const [itemsRows] = await pool.query<RowDataPacket[]>(
    `
    SELECT
      ii.id,
      ii.product_id,
      ii.quantity,
      ii.purchase_price,
      ii.selling_price,
      p.name AS product_name
    FROM invoice_items ii
    JOIN products p ON p.id = ii.product_id
    WHERE ii.invoice_id = ?
    `,
    [invoiceId]
  );

  return {
    id: Number(invoice.id),
    supplierId: Number(invoice.supplier_id),
    invoiceDate: String(invoice.invoice_date),
    paidAmount: Number(invoice.paid_amount),
    items: itemsRows.map(row => ({
      id: Number(row.id),
      productId: Number(row.product_id),
      quantity: Number(row.quantity),
      purchasePrice: Number(row.purchase_price),
      sellingPrice: Number(row.selling_price),
      product: {
        id: Number(row.product_id),
        name: String(row.product_name),
      },
    })),
  };
}


// تعديل فاتورة بالكامل
export async function updateInvoiceFull(invoiceId: number, data: InvoiceFullUpdate) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // تحديث بيانات الفاتورة الأساسية
   await connection.query(
  `UPDATE invoices 
   SET supplier_id = ?, invoice_date = ?, paid_amount = ? 
   WHERE id = ?`,
  [data.supplierId, data.invoiceDate, data.paidAmount, invoiceId]
);


    // جلب العناصر الحالية
    const [existingRows] = await connection.query<RowDataPacket[]>(
      `SELECT id FROM invoice_items WHERE invoice_id = ?`,
      [invoiceId]
    );
    const existingIds = existingRows.map(r => r.id as number);

    const incomingIds: number[] = [];
    let totalAmount = 0;

    for (const item of data.items) {
      const itemTotal = item.quantity * item.purchasePrice;
      totalAmount += itemTotal;

      if (item.id && existingIds.includes(item.id)) {
        // تحديث عنصر موجود
        await connection.query(
          `UPDATE invoice_items 
           SET quantity = ?, purchase_price = ?, selling_price = ?, total_cost = ?
           WHERE id = ?`,
          [item.quantity, item.purchasePrice, item.sellingPrice, itemTotal, item.id]
        );
        incomingIds.push(item.id);
      } else if (!item.id && item.productId) {
        // إضافة عنصر جديد
        const [result] = await connection.query<ResultSetHeader>(
          `INSERT INTO invoice_items
           (invoice_id, product_id, quantity, purchase_price, selling_price, total_cost)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [invoiceId, item.productId, item.quantity, item.purchasePrice, item.sellingPrice, itemTotal]
        );
        incomingIds.push(result.insertId);
      }
    }

    // حذف العناصر التي لم تعد موجودة
    const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));
    if (idsToDelete.length > 0) {
      await connection.query(
        `DELETE FROM invoice_items WHERE id IN (?)`,
        [idsToDelete]
      );
    }

    // تحديث الإجمالي والمبلغ المتبقي
    const remaining = totalAmount - data.paidAmount;
    await connection.query(
      `UPDATE invoices SET total_amount = ?, remaining = ? WHERE id = ?`,
      [totalAmount, remaining, invoiceId]
    );

    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
