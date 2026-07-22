import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { ResultSetHeader } from "mysql2";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // بيانات الفاتورة
  const [invoiceRows] = await pool.execute<RowDataPacket[]>(
    `
    SELECT
      id,
      warehouse_id,
      supplier_id,
      invoice_number,
      invoice_date,
      total,
      paid,
      remaining,
      status,
      notes
    FROM warehouse_purchase_invoices
    WHERE id = ?
    `,
    [id]
  );

  if (invoiceRows.length === 0) {
    return NextResponse.json(
      { message: "الفاتورة غير موجودة" },
      { status: 404 }
    );
  }

  // منتجات الفاتورة
  const [items] = await pool.execute<RowDataPacket[]>(
    `
    SELECT
      ii.id,
      ii.product_id,
      p.name,
      ii.quantity,
      ii.purchase_price
    FROM warehouse_purchase_invoice_items ii
    INNER JOIN products p
      ON p.id = ii.product_id
    WHERE ii.invoice_id = ?
    `,
    [id]
  );

  return NextResponse.json({
    ...invoiceRows[0],
    items,
  });
}


export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // المنتجات القديمة
    const [oldItems] = await conn.execute<RowDataPacket[]>(
      `
      SELECT product_id, quantity
      FROM warehouse_purchase_invoice_items
      WHERE invoice_id = ?
      `,
      [id]
    );

    // إزالة أثر الفاتورة القديمة من المخزون
    for (const item of oldItems) {
      await conn.execute(
        `
        UPDATE warehouse_stock
        SET quantity = quantity - ?
        WHERE warehouse_id = ?
          AND product_id = ?
        `,
        [
          item.quantity,
          body.warehouseId,
          item.product_id,
        ]
      );
    }

    // حذف العناصر القديمة
    await conn.execute(
      `
      DELETE FROM warehouse_purchase_invoice_items
      WHERE invoice_id = ?
      `,
      [id]
    );

    // تحديث بيانات الفاتورة
    await conn.execute(
      `
      UPDATE warehouse_purchase_invoices
      SET
        supplier_id=?,
        invoice_number=?,
        invoice_date=?,
        total=?,
        paid=?,
        remaining=?,
        status=?,
        notes=?
      WHERE id=?
      `,
      [
        body.supplierId,
        body.invoiceNumber,
        body.invoiceDate,
        body.total,
        body.paid,
        body.remaining,
        body.remaining <= 0
          ? "paid"
          : body.paid > 0
          ? "partial"
          : "unpaid",
        body.notes,
        id,
      ]
    );

    // إضافة العناصر الجديدة للمخزون
    for (const item of body.items) {

      await conn.execute(
        `
        INSERT INTO warehouse_purchase_invoice_items
        (invoice_id, product_id, quantity, purchase_price)
        VALUES (?,?,?,?)
        `,
        [
          id,
          item.productId,
          item.quantity,
          item.purchasePrice,
        ]
      );

      await conn.execute(
        `
        INSERT INTO warehouse_stock
        (warehouse_id, product_id, quantity)
        VALUES (?,?,?)
        ON DUPLICATE KEY UPDATE
        quantity = quantity + VALUES(quantity)
        `,
        [
          body.warehouseId,
          item.productId,
          item.quantity,
        ]
      );
    }

    await conn.commit();

    return NextResponse.json({
      message: "تم تعديل الفاتورة بنجاح",
    });

  } catch (err: any) {

    await conn.rollback();

    console.error(err);

    return NextResponse.json(
      {
        message: err.message,
      },
      {
        status: 500,
      }
    );

  } finally {

    conn.release();

  }
}
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const conn = await pool.getConnection();

  try {

    await conn.beginTransaction();

    const [invoiceRows] = await conn.execute<RowDataPacket[]>(
      `
      SELECT warehouse_id
      FROM warehouse_purchase_invoices
      WHERE id=?
      `,
      [id]
    );

    if (invoiceRows.length === 0) {
      throw new Error("الفاتورة غير موجودة");
    }

    const warehouseId = invoiceRows[0].warehouse_id;

    const [items] = await conn.execute<RowDataPacket[]>(
      `
      SELECT product_id, quantity
      FROM warehouse_purchase_invoice_items
      WHERE invoice_id=?
      `,
      [id]
    );

    // طرح الكميات
    for (const item of items) {

      await conn.execute(
        `
        UPDATE warehouse_stock
        SET quantity = quantity - ?
        WHERE warehouse_id = ?
          AND product_id = ?
        `,
        [
          item.quantity,
          warehouseId,
          item.product_id,
        ]
      );

    }

    await conn.execute(
      `
      DELETE FROM warehouse_purchase_invoice_items
      WHERE invoice_id = ?
      `,
      [id]
    );

    await conn.execute(
      `
      DELETE FROM warehouse_purchase_invoices
      WHERE id = ?
      `,
      [id]
    );

    await conn.commit();

    return NextResponse.json({
      message: "تم حذف الفاتورة",
    });

  } catch (err) {

    await conn.rollback();

    console.error(err);

    return NextResponse.json(
      {
        message: "فشل حذف الفاتورة",
      },
      {
        status: 500,
      }
    );

  } finally {

    conn.release();

  }
}