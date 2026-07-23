import { NextResponse } from "next/server";
import { getWarehousePurchaseInvoiceItems } from "@/lib/services/warehouse-purchase-invoice.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const items = await getWarehousePurchaseInvoiceItems(Number(id));

    return NextResponse.json(items);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "حدث خطأ" },
      { status: 500 }
    );
  }
}   