import { NextRequest, NextResponse } from "next/server";
import { getAllStock, addStock } from "@/lib/services/stock.service";

export async function GET() {
  try {
    const stock = await getAllStock();

    return NextResponse.json(stock);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to fetch stock" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { items } = body;

  if (!items || !Array.isArray(items)) {
    return NextResponse.json(
      { message: "items required" },
      { status: 400 }
    );
  }

  for (const item of items) {
    if (!item.productId || !item.quantity) continue;

    await addStock(
      Number(item.productId),
      Number(item.quantity)
    );
  }

  return NextResponse.json({ success: true });
}