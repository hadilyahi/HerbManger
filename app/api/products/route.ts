import { NextResponse } from "next/server";
import { getAllProducts, createProduct, deleteProduct, updateProduct } from "@/lib/services/product.service";

export async function GET() {
  const products = await getAllProducts();
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const body = await req.json();
  await createProduct(body.name, body.categoryId, body.unit);
  return NextResponse.json({ message: "Product created" });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await deleteProduct(Number(id));
  return NextResponse.json({ message: "Product deleted" });
}
export async function PATCH(req: Request) {
  const body = await req.json();

  if (!body?.id || !body?.name || !body?.categoryId ) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await updateProduct(body.id, body.name, body.categoryId);
  return NextResponse.json({ message: "Product updated" });
}
