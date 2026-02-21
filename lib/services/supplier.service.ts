import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2/promise";

// ✅ واجهة المورد مع معلومات الدين
export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  created_at: string;
  totalDebt?: number;   // مجموع الفواتير
  totalPaid?: number;   // مجموع المدفوع
  remaining?: number;   // المتبقي
}

// ✅ واجهة صف الفاتورة
interface InvoiceRow extends RowDataPacket {
  id: number;
  total_amount: number;
  paid_amount: number;
}

// =====================
// ✅ جلب كل الموردين مع حساب الدين
export async function getAllSuppliers(): Promise<Supplier[]> {
  const [rows] = await pool.query<RowDataPacket[] & Supplier[]>(`
    SELECT 
      s.id, 
      s.name, 
      s.phone, 
      s.created_at,
      IFNULL(SUM(f.total_amount), 0) AS totalDebt,
      IFNULL(SUM(f.paid_amount), 0) AS totalPaid,
      IFNULL(SUM(f.total_amount),0) - IFNULL(SUM(f.paid_amount),0) AS remaining
    FROM suppliers s
    LEFT JOIN invoices f ON f.supplier_id = s.id
    GROUP BY s.id, s.name, s.phone, s.created_at
    ORDER BY s.created_at DESC
  `);

  return rows as Supplier[];
}

// ✅ إضافة مورد جديد
export async function createSupplier(name: string, phone?: string) {
  await pool.query(
    "INSERT INTO suppliers (name, phone) VALUES (?, ?)",
    [name, phone || null]
  );
}

// ✅ تعديل مورد
export async function updateSupplier(id: number, name: string, phone?: string) {
  await pool.query(
    "UPDATE suppliers SET name=?, phone=? WHERE id=?",
    [name, phone || null, id]
  );
}

// ✅ حذف مورد
export async function deleteSupplier(id: number) {
  await pool.query("DELETE FROM suppliers WHERE id=?", [id]);
}

// =====================
// ✅ إضافة دين جديد للمورد
export async function addSupplierDebt(supplierId: number, amount: number) {
  // إنشاء فاتورة دين بدون دفع
  await pool.query(
    "INSERT INTO invoices (supplier_id, invoice_date, total_amount, paid_amount) VALUES (?, NOW(), ?, 0)",
    [supplierId, amount]
  );
}

// ✅ تسجيل دفعة جديدة للمورد
export async function addSupplierPayment(supplierId: number, amount: number) {
  // اختيار الفواتير المفتوحة (الأقدم أولاً)
  const [rows] = await pool.query<InvoiceRow[]>(
    "SELECT id, total_amount, paid_amount FROM invoices WHERE supplier_id=? AND total_amount>paid_amount ORDER BY invoice_date ASC",
    [supplierId]
  );

  let remainingAmount = amount;

  for (const invoice of rows) {
    const invoiceRemaining = invoice.total_amount - invoice.paid_amount;
    if (remainingAmount <= 0) break;

    const payment = Math.min(remainingAmount, invoiceRemaining);

    await pool.query(
      "UPDATE invoices SET paid_amount=paid_amount+? WHERE id=?",
      [payment, invoice.id]
    );

    remainingAmount -= payment;
  }
}
