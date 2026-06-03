import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const productIdParam = searchParams.get("productId");

    const productId = productIdParam ? Number(productIdParam) : undefined;

    // =======================
    // Validate inputs
    // =======================
    if (!startDate || !endDate) {
      return NextResponse.json(
        { message: "يجب تحديد تاريخ البداية والنهاية" },
        { status: 400 }
      );
    }

    if (productIdParam && (productId === undefined || isNaN(productId))) {
      return NextResponse.json(
        { message: "المنتج غير صحيح" },
        { status: 400 }
      );
    }

    // =======================
    // 1️⃣ إحصائيات المنتج
    // =======================
    let productStatsQuery = `
      SELECT
        ii.id,
        i.invoice_date,
        ii.quantity AS total_quantity,
        ii.purchase_price,
        ii.selling_price
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE DATE(i.invoice_date) BETWEEN ? AND ?
    `;

    const queryParams: (string | number)[] = [startDate, endDate];

    if (productId !== undefined) {
      productStatsQuery += ` AND ii.product_id = ?`;
      queryParams.push(productId);
    }

    productStatsQuery += `
      ORDER BY i.invoice_date ASC, ii.id ASC
    `;

    const [productStatsRows] = await pool.query(
      productStatsQuery,
      queryParams
    );

    // =======================
    // 2️⃣ المنتجات الأكثر شراءً
    // =======================
    const [topProductsRows] = await pool.query(
      `
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        SUM(ii.quantity) AS total_quantity,
        SUM(ii.total_cost) AS total_amount
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      JOIN products p ON ii.product_id = p.id
      WHERE DATE(i.invoice_date) BETWEEN ? AND ?
      GROUP BY p.id, p.name
      ORDER BY total_quantity DESC
      LIMIT 10
      `,
      [startDate, endDate]
    );

    // =======================
    // 3️⃣ ديون الموردين
    // =======================
    const [suppliersDebtRows] = await pool.query(
      `
      SELECT
        s.id AS supplier_id,
        s.name AS supplier_name,
        SUM(i.total_amount) AS total_invoices,
        SUM(i.paid_amount) AS paid,
        SUM(i.remaining) AS remaining
      FROM invoices i
      JOIN suppliers s ON i.supplier_id = s.id
      WHERE DATE(i.invoice_date) BETWEEN ? AND ?
      GROUP BY s.id, s.name
      ORDER BY remaining DESC
      `,
      [startDate, endDate]
    );

    // =======================
    // 4️⃣ قائمة المنتجات
    // =======================
    const [productsListRows] = await pool.query(`
      SELECT id, name
      FROM products
      ORDER BY name
    `);

    // =======================
    // Response
    // =======================
    return NextResponse.json({
      productStats: productStatsRows,
      topProducts: topProductsRows,
      suppliersDebt: suppliersDebtRows,
      productsList: productsListRows,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        message: "حدث خطأ أثناء استخراج الإحصائيات",
      },
      {
        status: 500,
      }
    );
  }
}