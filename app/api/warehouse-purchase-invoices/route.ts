import { NextResponse } from "next/server";
import { getWarehousePurchaseInvoices } from "@/lib/services/warehouse-purchase-invoice.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date") || "";

    const invoices = await getWarehousePurchaseInvoices(date);

    return NextResponse.json(invoices);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "حدث خطأ" },
      { status: 500 }
    );
  }
}