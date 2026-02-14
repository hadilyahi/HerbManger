import { NextResponse } from "next/server";
import { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier } from "@/lib/services/supplier.service";

// جلب كل الموردين
export async function GET() {
  try {
    const suppliers = await getAllSuppliers();
    return NextResponse.json(suppliers);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch suppliers", details: err }, { status: 500 });
  }
}

// إضافة مورد جديد
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    await createSupplier(body.name, body.phone);
    return NextResponse.json({ message: "Supplier created" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create supplier", details: err }, { status: 500 });
  }
}

// تعديل مورد
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    if (!body?.id || !body?.name) return NextResponse.json({ error: "ID & Name required" }, { status: 400 });

    await updateSupplier(body.id, body.name, body.phone);
    return NextResponse.json({ message: "Supplier updated" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update supplier", details: err }, { status: 500 });
  }
}

// حذف مورد
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await deleteSupplier(Number(id));
    return NextResponse.json({ message: "Supplier deleted" });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete supplier", details: err }, { status: 500 });
  }
}
