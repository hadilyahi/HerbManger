import { NextResponse } from "next/server";
import {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  addSupplierDebt,
  addSupplierPayment,
} from "@/lib/services/supplier.service";

// ==========================
// GET: جلب كل الموردين مع الدين
export async function GET() {
  try {
    const suppliers = await getAllSuppliers();
    return NextResponse.json(suppliers);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch suppliers", details: err },
      { status: 500 }
    );
  }
}

// POST: إضافة مورد جديد أو إضافة دين
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // إضافة مورد جديد
    if (body?.name) {
      await createSupplier(body.name, body.phone);
      return NextResponse.json({ message: "Supplier created" });
    }

    // إضافة دين لمورد موجود
    if (body?.supplierId && body?.debtAmount) {
      await addSupplierDebt(Number(body.supplierId), Number(body.debtAmount));
      return NextResponse.json({ message: "Debt added to supplier" });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to process request", details: err },
      { status: 500 }
    );
  }
}

// PATCH: تعديل مورد أو تسجيل دفعة جديدة
export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    // تعديل بيانات مورد
    if (body?.id && body?.name) {
      await updateSupplier(body.id, body.name, body.phone);
      return NextResponse.json({ message: "Supplier updated" });
    }

    // تسجيل دفعة جديدة لمورد
    if (body?.supplierId && body?.paymentAmount) {
      await addSupplierPayment(
        Number(body.supplierId),
        Number(body.paymentAmount)
      );
      return NextResponse.json({ message: "Payment registered" });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to process request", details: err },
      { status: 500 }
    );
  }
}

// DELETE: حذف مورد
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "ID required" }, { status: 400 });

    await deleteSupplier(Number(id));
    return NextResponse.json({ message: "Supplier deleted" });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete supplier", details: err },
      { status: 500 }
    );
  }
}
