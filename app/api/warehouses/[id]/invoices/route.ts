import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [rows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT
        i.id,
        i.invoice_number,
        i.invoice_date,
        s.name AS supplier,
        i.total,
        i.paid,
        i.remaining,
        i.status
      FROM warehouse_purchase_invoices i
      LEFT JOIN suppliers s
        ON s.id = i.supplier_id
      WHERE i.warehouse_id = ?
      ORDER BY i.id DESC
      `,
      [id]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "فشل تحميل الفواتير" },
      { status: 500 }
    );
  }
}