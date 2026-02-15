import { NextRequest } from "next/server";
import { updateProduct, deleteProduct } from "@/lib/services/product.service";

// ✅ PATCH
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      throw new Error("الـ ID غير صالح");
    }

    const data = await request.json();
    const { name, categoryId } = data;

    if (!name || !categoryId) {
      throw new Error("البيانات غير كاملة: name و categoryId مطلوبان");
    }

    const numericCategoryId = Number(categoryId);
    if (isNaN(numericCategoryId) || numericCategoryId <= 0) {
      throw new Error("الفئة غير صالحة");
    }

    await updateProduct(numericId, name, numericCategoryId);

    return new Response(
      JSON.stringify({ message: "تم التعديل بنجاح" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "فشل في التعديل";

    console.error("PATCH error:", message);

    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ✅ DELETE
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      throw new Error("الـ ID غير صالح");
    }

    await deleteProduct(numericId);

    return new Response(
      JSON.stringify({ message: "تم الحذف بنجاح" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "فشل في الحذف";

    console.error("DELETE error:", message);

    return new Response(JSON.stringify({ message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
