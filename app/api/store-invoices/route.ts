import { NextResponse } from "next/server";
import { createStoreInvoice } from "@/lib/services/storeInvoice.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await createStoreInvoice(body);

    return NextResponse.json(result);
  } catch (error) {
  console.error("STORE INVOICE ERROR:", error);

  return NextResponse.json(
    {
      success: false,
      message: error instanceof Error ? error.message : "حدث خطأ",
    },
    { status: 500 }
  );
}
}