import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {

  try {

    const search = req.nextUrl.searchParams.get("q") || "";

    const [rows] = await pool.query(
      `
      SELECT

        wii.id AS warehouse_invoice_item_id,

        wii.warehouse_invoice_id,

        wii.product_id,

        p.name AS product_name,

        wii.purchase_price,

        wii.remaining_quantity

      FROM warehouse_invoice_items wii

      INNER JOIN products p
      ON p.id = wii.product_id

      WHERE
          wii.remaining_quantity > 0
      AND
          p.name LIKE ?

      ORDER BY p.name
      `,
      [`%${search}%`]
    );

    return NextResponse.json(rows);

  } catch (err) {

    console.log(err);

    return NextResponse.json(
      {
        message: "حدث خطأ"
      },
      {
        status:500
      }
    );

  }

}