import { NextRequest, NextResponse } from "next/server";
import {
  getStoreInvoices,
  getStoreProducts,
} from "@/lib/services/store.service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const invoices = await getStoreInvoices(Number(id));
  const products = await getStoreProducts(Number(id));

  return NextResponse.json({
    invoices,
    products,
  });
}