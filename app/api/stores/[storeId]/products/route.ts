import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const {
      productId,
      quantity,
      purchasePrice,
      sellingPrice,
    } = body;

    const existing = await query<any[]>(
`
SELECT store_id
FROM store_stock
WHERE store_id = ?
AND product_id = ?
LIMIT 1
`,
[id, productId]
);

    if (existing.length > 0) {
      await query(
        `
          UPDATE store_stock
          SET
            quantity = quantity + ?,
            purchase_price = ?,
            selling_price = ?
          WHERE store_id = ?
          AND product_id = ?
        `,
        [
          quantity,
          purchasePrice,
          sellingPrice,
          id,
          productId,
        ]
      );
    } else {
      await query(
        `
          INSERT INTO store_stock
          (
            store_id,
            product_id,
            quantity,
            purchase_price,
            selling_price
          )
          VALUES
          (
            ?, ?, ?, ?, ?
          )
        `,
        [
          id,
          productId,
          quantity,
          purchasePrice,
          sellingPrice,
        ]
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}