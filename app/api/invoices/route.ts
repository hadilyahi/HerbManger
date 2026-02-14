// ضع تعريف واجهة Invoice هنا
import { NextResponse } from "next/server";
import { createInvoice, getAllInvoices } from "@/lib/services/invoice.service";

// export async function GET() {
//   try {
//     const invoices = await getAllInvoices();
//     return NextResponse.json(invoices);
//   } catch (err) {
//     return NextResponse.json({ error: "Failed to fetch invoices", details: err }, { status: 500 });
//   }
// }

// تعريف واجهة الفاتورة هنا
interface Invoice {
  id: number;
  invoice_date: string;
  total_amount: number;
  paid_amount: number;
  remaining: number;
  supplier_name: string;
  items_count: number;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const beforeYearParam = searchParams.get("beforeYear");
    const yearParam = searchParams.get("year");

    const rows = await getAllInvoices();
    let invoices: Invoice[] = Array.isArray(rows) ? rows : [];

    if (beforeYearParam) {
      const beforeYear = Number(beforeYearParam);
      if (!isNaN(beforeYear)) {
        invoices = invoices.filter(
          (inv: Invoice) => new Date(inv.invoice_date).getFullYear() < beforeYear
        );
      }
    }

    if (yearParam) {
      const year = Number(yearParam);
      if (!isNaN(year)) {
        invoices = invoices.filter(
          (inv: Invoice) => new Date(inv.invoice_date).getFullYear() === year
        );
      }
    }

    return NextResponse.json(invoices);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب الفواتير", details: err }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body?.supplierId || !body?.invoiceDate || !body?.items?.length) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const result = await createInvoice(body);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Failed to create invoice", details: err }, { status: 500 });
  }
}


