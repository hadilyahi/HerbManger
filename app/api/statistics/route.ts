import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get("year");
    const productIdParam = searchParams.get("productId");

    const year = yearParam ? Number(yearParam) : new Date().getFullYear();
    const productId = productIdParam ? Number(productIdParam) : undefined;

    // =======================
    // Validate inputs
    // =======================
    if (isNaN(year)) {
      return NextResponse.json(
        { message: "السنة غير صحيحة" },
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
    // 1️⃣ إحصائيات المنتج (حسب تاريخ الفاتورة)
    // =======================
    let productStatsQuery = `
      SELECT 
        DATE(i.invoice_date) AS invoice_date,
        SUM(ii.quantity) AS total_quantity,
        AVG(ii.purchase_price) AS purchase_price,
        AVG(ii.selling_price) AS selling_price
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE YEAR(i.invoice_date) = ?
    `;

    const queryParams: number[] = [year];

    if (productId !== undefined) {
      productStatsQuery += ` AND ii.product_id = ?`;
      queryParams.push(productId);
    }

    productStatsQuery += `
      GROUP BY DATE(i.invoice_date)
      ORDER BY DATE(i.invoice_date)
    `;

    const [productStatsRows] = await pool.query(
      productStatsQuery,
      queryParams
    );

    // =======================
    // 2️⃣ المنتجات الأكثر شراءً (حسب السنة)
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
      WHERE YEAR(i.invoice_date) = ?
      GROUP BY p.id, p.name
      ORDER BY total_quantity DESC
      LIMIT 10
    `,
      [year]
    );

    // =======================
    // 3️⃣ الديون والمدفوعات للموردين
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
      WHERE YEAR(i.invoice_date) = ?
      GROUP BY s.id, s.name
      ORDER BY remaining DESC
    `,
      [year]
    );

    // =======================
    // 4️⃣ قائمة المنتجات (Dropdown)
    // =======================
    const [productsListRows] = await pool.query(`
      SELECT id, name FROM products ORDER BY name
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
      { message: "حدث خطأ أثناء استخراج الإحصائيات" },
      { status: 500 }
    );
  }
}