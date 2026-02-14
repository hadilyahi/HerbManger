import { NextResponse } from "next/server";
import { getInvoiceById, updateInvoicePaidAmount, deleteInvoice } from "@/lib/services/invoice.service";

interface Params {
  params: { id: string }; // ← تأكد أنها ليست Promise
}

export async function GET(req: Request, { params }: Params) {
  const invoiceId = parseInt(params.id);
  if (isNaN(invoiceId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json(invoice);
}

export async function DELETE(req: Request, { params }: Params) {
  const invoiceId = parseInt(params.id);
  if (isNaN(invoiceId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  await deleteInvoice(invoiceId);
  return NextResponse.json({ success: true });
}

export async function PUT(req: Request, { params }: Params) {
  const invoiceId = parseInt(params.id);
  if (isNaN(invoiceId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await req.json();
  const paidAmount = Number(body.paidAmount);
  if (isNaN(paidAmount)) {
    return NextResponse.json({ error: "Invalid paid amount" }, { status: 400 });
  }

  await updateInvoicePaidAmount(invoiceId, paidAmount);
  return NextResponse.json({ success: true });
}
