import { NextResponse } from "next/server";
import { createStore, getStores } from "@/lib/services/store.service";

export async function GET() {
  try {
    const stores = await getStores();
    return NextResponse.json(stores);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "فشل تحميل المحلات" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name) {
      return NextResponse.json(
        { message: "اسم المحل مطلوب" },
        { status: 400 }
      );
    }

    const id = await createStore(body);

    return NextResponse.json({
      message: "تم إضافة المحل",
      id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "حدث خطأ أثناء إضافة المحل" },
      { status: 500 }
    );
  }
}