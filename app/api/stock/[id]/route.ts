import { NextRequest, NextResponse } from "next/server";
import { updateStock, deleteStock } from "@/lib/services/stock.service";

// =====================
// UPDATE STOCK
// =====================
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const productId = Number(context.params.id);
    const quantity = Number(body.quantity);

    if (!productId) {
      return NextResponse.json(
        { message: "Invalid product id" },
        { status: 400 }
      );
    }

    if (Number.isNaN(quantity) || quantity < 0) {
      return NextResponse.json(
        { message: "Invalid quantity" },
        { status: 400 }
      );
    }

    await updateStock(productId, quantity);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update stock" },
      { status: 500 }
    );
  }
}

// =====================
// DELETE STOCK
// =====================
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const productId = Number(context.params.id);

    if (!productId) {
      return NextResponse.json(
        { message: "Invalid product id" },
        { status: 400 }
      );
    }

    await deleteStock(productId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to delete stock" },
      { status: 500 }
    );
  }
}