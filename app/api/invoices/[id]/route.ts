import { NextResponse } from "next/server";
import {
  getInvoiceById,
  updateInvoicePaidAmount,
  deleteInvoice,
} from "@/lib/services/invoice.service";

interface Props {
  params: { id: string };
}
interface Params {
  params: { id: string };
}

/* 🔍 DETAILS */
export async function GET(_: Request, { params }: Params) {
  try {
    const data = await getInvoiceById(Number(params.id));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch invoice details" },
      { status: 500 }
    );
  }
}

/* ✏️ EDIT */
export async function PATCH(req: Request, { params }: Params) {
  try {
    const body = await req.json();
    if (body.paidAmount === undefined) {
      return NextResponse.json({ error: "Missing paidAmount" }, { status: 400 });
    }

    await updateInvoicePaidAmount(Number(params.id), body.paidAmount);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

/* 🗑️ DELETE */
export async function DELETE(req: Request, { params }: Props) {
  // params.id يأتي من اسم الملف [id]
  const id = params.id;
  const invoiceId = Number(id);

  if (!invoiceId || isNaN(invoiceId)) {
    return NextResponse.json(
      { message: "رقم الفاتورة غير صحيح" },
      { status: 400 }
    );
  }

  try {
    await deleteInvoice(invoiceId);
    return NextResponse.json({ message: "تم حذف الفاتورة بنجاح" });
  } catch (err) {
    console.error("Error deleting invoice:", err);
    return NextResponse.json(
      { message: "حدث خطأ أثناء حذف الفاتورة" },
      { status: 500 }
    );
  }
}