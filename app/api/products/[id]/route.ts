import { updateProduct, deleteProduct } from "@/lib/services/product.service";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = context.params;

    const data = await req.json();
    console.log("PATCH request body:", data);

    const { name, categoryId } = data;

    if (!name || !categoryId) {
      throw new Error("البيانات غير كاملة: name و categoryId مطلوبان");
    }

    const numericId = Number(id);
    const numericCategoryId = Number(categoryId);

if (isNaN(numericId) || numericCategoryId <= 0) {
  throw new Error("الـ ID أو الفئة غير صالحة");
}


    await updateProduct(numericId, name, numericCategoryId);

    return new Response(JSON.stringify({ message: "تم التعديل بنجاح" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("PATCH error:", error.message);
      return new Response(JSON.stringify({ message: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ message: "فشل في التعديل" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    const numericId = Number(id);
    if (isNaN(numericId)) throw new Error("الـ ID غير صالح");

    await deleteProduct(numericId);

    return new Response(JSON.stringify({ message: "تم الحذف بنجاح" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("DELETE error:", error.message);
      return new Response(JSON.stringify({ message: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ message: "فشل في الحذف" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
