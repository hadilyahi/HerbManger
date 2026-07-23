import { query } from "@/lib/db";

export interface WarehousePurchaseInvoice {
  id: number;
  warehouse_id: number;
  supplier_id: number;
  invoice_number: string;
  invoice_date: string;
  total: number;
}

export async function getWarehousePurchaseInvoices(
  date?: string
) {
  if (date) {
    return await query<WarehousePurchaseInvoice[]>(
      `
      SELECT
        id,
        warehouse_id,
        supplier_id,
        invoice_number,
        invoice_date,
        total
      FROM warehouse_purchase_invoices
      WHERE invoice_date = ?
      ORDER BY id DESC
      `,
      [date]
    );
  }

  return await query<WarehousePurchaseInvoice[]>(
    `
   SELECT
  id,
  warehouse_id,
  invoice_number,
  supplier_id,
  invoice_date,
  total
FROM warehouse_purchase_invoices
    ORDER BY id DESC
    `
  );
}

export async function getWarehousePurchaseInvoiceItems(invoiceId: number) {
  return await query(
    `
    SELECT
      wpi.id,
      wpi.product_id,
      p.name AS product_name,
      wpi.quantity,
      wpi.remaining_quantity,
      wpi.purchase_price
    FROM warehouse_purchase_invoice_items wpi
    INNER JOIN products p
      ON p.id = wpi.product_id
    WHERE wpi.invoice_id = ?
      AND wpi.remaining_quantity > 0
    `,
    [invoiceId]
  );
}