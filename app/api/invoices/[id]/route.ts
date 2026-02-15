import { NextRequest, NextResponse } from "next/server";
import {
  getInvoiceById,
  updateInvoicePaidAmount,
  deleteInvoice,
} from "@/lib/services/invoice.service";

// ✅ GET
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const invoiceId = Number(id);

  if (isNaN(invoiceId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json(invoice);
}

// ✅ DELETE
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const invoiceId = Number(id);

  if (isNaN(invoiceId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  await deleteInvoice(invoiceId);
  return NextResponse.json({ success: true });
}

// ✅ PUT
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const invoiceId = Number(id);

  if (isNaN(invoiceId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();
  const paidAmount = Number(body.paidAmount);

  if (isNaN(paidAmount)) {
    return NextResponse.json(
      { error: "Invalid paid amount" },
      { status: 400 }
    );
  }

  await updateInvoicePaidAmount(invoiceId, paidAmount);
  return NextResponse.json({ success: true });
}
