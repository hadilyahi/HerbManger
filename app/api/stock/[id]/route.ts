import { NextRequest, NextResponse } from "next/server";
import { updateStock, deleteStock } from "@/lib/services/stock.service";

// =====================
// UPDATE STOCK
// =====================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const productId = Number(id);
    const quantity = Number(body.quantity);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const productId = Number(id);

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