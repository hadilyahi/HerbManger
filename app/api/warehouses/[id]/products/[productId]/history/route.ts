import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
      productId: string;
    }>;
  }
) {
  const { id, productId } = await params;

  const [rows] = await pool.execute<RowDataPacket[]>(
    `
    SELECT
        ii.id,
        i.invoice_number,
        i.invoice_date,
        s.name AS supplier,
        ii.quantity,
        ii.purchase_price
    FROM warehouse_purchase_invoice_items ii

    INNER JOIN warehouse_purchase_invoices i
        ON i.id = ii.invoice_id

    INNER JOIN suppliers s
        ON s.id = i.supplier_id

    WHERE
        i.warehouse_id = ?
        AND ii.product_id = ?

    ORDER BY
        i.invoice_date DESC,
        ii.id DESC
    `,
    [id, productId]
  );

  return NextResponse.json(rows);
}