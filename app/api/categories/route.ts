import { NextResponse } from "next/server";
import { getAllCategories, createCategory, deleteCategory } from "@/lib/services/category.service";

export async function GET() {
  const categories = await getAllCategories();
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body?.name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  await createCategory(body.name);
  return NextResponse.json({ message: "Category created" });
}


export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  await deleteCategory(Number(id));
  return NextResponse.json({ message: "Category deleted" });
}