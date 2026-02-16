import { NextRequest, NextResponse } from "next/server";
import { getInvoiceById, deleteInvoice, updateInvoiceFull, InvoiceItemUpdate } from "@/lib/services/invoice.service";

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

// ✅ PUT - تحديث الفاتورة بالكامل
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const invoiceId = Number(id);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    const { supplierId, paidAmount, items } = body;

    if (!supplierId || !Array.isArray(items) || isNaN(Number(paidAmount))) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // تحويل العناصر إلى النوع الصحيح
    const parsedItems: InvoiceItemUpdate[] = items.map((i: {
      id?: number;
      productId?: number;
      quantity: number;
      purchasePrice: number;
      sellingPrice: number;
    }) => {
      if (!i.id && !i.productId) {
        throw new Error("Each item must have either an existing id or a productId");
      }

      return {
        id: i.id ? Number(i.id) : 0, // 0 أو أي قيمة مؤقتة للعنصر الجديد
        productId: i.productId ? Number(i.productId) : undefined,
        quantity: Number(i.quantity),
        purchasePrice: Number(i.purchasePrice),
        sellingPrice: Number(i.sellingPrice),
      };
    });

    await updateInvoiceFull(invoiceId, {
      supplierId: Number(supplierId),
      paidAmount: Number(paidAmount),
      items: parsedItems,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update invoice";
    console.error("PUT /invoices/:id error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
