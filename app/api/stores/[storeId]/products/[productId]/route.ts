import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      storeId: string;
      productId: string;
    }>;
  },
) {
  try {
    const { storeId, productId } = await params;

    const body = await request.json();

    const quantity = Number(body.quantity);
    const purchasePrice = Number(body.purchasePrice);
    const sellingPrice = Number(body.sellingPrice);

    console.log("UPDATE DATA:", {
      storeId,
      productId,
      quantity,
      purchasePrice,
      sellingPrice,
    });

    const result = await query(
      `
      UPDATE store_stock
      SET quantity = ?, purchase_price = ?, selling_price = ?
      WHERE store_id = ? AND product_id = ?
      `,
      [quantity, purchasePrice, sellingPrice, storeId, productId],
    );

    console.log("SQL RESULT:", result);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("PUT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "حدث خطأ أثناء التعديل",
      },
      { status: 500 },
    );
  }
}
