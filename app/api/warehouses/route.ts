import {
  createWarehouse,
  deleteWarehouse,
  getWarehouses,
  updateWarehouse,
} from "@/lib/services/warehouse.service";

import { NextResponse } from "next/server";

// جلب جميع المخازن
export async function GET() {
  try {
    const data = await getWarehouses();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "خطأ أثناء جلب المخازن" },
      { status: 500 }
    );
  }
}

// إضافة مخزن
export async function POST(req: Request) {
  try {
    const body = await req.json();

    await createWarehouse(body);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "خطأ أثناء إضافة المخزن" },
      { status: 500 }
    );
  }
}

// تعديل مخزن
export async function PUT(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "المعرف مطلوب" },
        { status: 400 }
      );
    }

    const body = await req.json();

    await updateWarehouse(Number(id), body);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "خطأ أثناء تعديل المخزن" },
      { status: 500 }
    );
  }
}

// حذف مخزن
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "المعرف مطلوب" },
        { status: 400 }
      );
    }

    await deleteWarehouse(Number(id));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "خطأ أثناء حذف المخزن" },
      { status: 500 }
    );
  }
}