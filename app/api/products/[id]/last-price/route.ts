import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const rows = await query<any[]>(
      `
      SELECT purchase_price
      FROM invoice_items
      WHERE product_id = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [id]
    );

    return NextResponse.json(
      rows[0] ?? {
        purchase_price: 0,
      }
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        purchase_price: 0,
      },
      {
        status: 500,
      }
    );
  }
}