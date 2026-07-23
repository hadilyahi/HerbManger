import { NextResponse } from "next/server";
import { getStoreById } from "@/lib/services/store.service";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const store = await getStoreById(Number(id));

    if (!store) {
      return NextResponse.json(
        { message: "المحل غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json(store);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "حدث خطأ" },
      { status: 500 }
    );
  }
}