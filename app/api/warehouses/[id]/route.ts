import { NextResponse } from "next/server";
import { getWarehouseById } from "@/lib/services/warehouse.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: Request,
  { params }: Props
) {
  try {
    const { id } = await params;

    const warehouse = await getWarehouseById(Number(id));

    if (!warehouse) {
      return NextResponse.json(
        { message: "المخزن غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json(warehouse);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "حدث خطأ أثناء جلب بيانات المخزن" },
      { status: 500 }
    );
  }
}
