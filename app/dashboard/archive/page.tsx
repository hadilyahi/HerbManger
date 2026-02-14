"use client";

import { useEffect, useState } from "react";

interface Invoice {
  id: number;
  invoice_date: string;
  total_amount: number;
  paid_amount: number;
  remaining: number;
  supplier_name: string;
  items_count: number;
}

export default function ArchivePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // تعريف دالة fetch داخل effect
    const fetchData = async () => {
      try {
        let url = "/api/invoices?beforeYear=" + currentYear;
        if (selectedYear) {
          url += `&year=${selectedYear}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        setInvoices(data);
      } catch (err) {
        console.error("Failed to fetch archived invoices:", err);
      }
    };

    fetchData(); // استدعاء الدالة مباشرة داخل effect
  }, [selectedYear, currentYear]); // استخدام currentYear مباشرة كـ dependency

  // توليد سنوات الأرشيف (قبل السنة الحالية)
  const archivedYears = Array.from({ length: 5 }, (_, i) => currentYear - i - 1);

  return (
    <div className="bg-white min-h-screen px-16 pt-12">
      <h1 className="text-4xl font-bold text-center mb-14">أرشيف الفواتير</h1>

      {/* فلترة حسب السنة */}
      <div className="flex gap-4 mb-8 justify-center">
        <label>اختر السنة: </label>
        <select
          value={selectedYear || ""}
          onChange={(e) =>
            setSelectedYear(e.target.value ? Number(e.target.value) : null)
          }
          className="border px-2 py-1 rounded"
        >
          <option value="">-- جميع السنوات --</option>
          {archivedYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* جدول الفواتير */}
      <div className="overflow-x-auto border border-green-700">
        <table className="w-full text-right border-collapse">
          <thead className="bg-green-300 text-black font-bold">
            <tr>
              <th className="p-4 border border-green-700">رقم الفاتورة</th>
              <th className="p-4 border border-green-700">تاريخ الفاتورة</th>
              <th className="p-4 border border-green-700">عدد المنتجات</th>
              <th className="p-4 border border-green-700">المبلغ الإجمالي</th>
              <th className="p-4 border border-green-700">المدفوع</th>
              <th className="p-4 border border-green-700">المتبقي</th>
              <th className="p-4 border border-green-700">المورد</th>
            </tr>
          </thead>
          <tbody className="bg-green-100">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="p-4 border border-green-700 text-center">{invoice.id}</td>
                <td className="p-4 border border-green-700 text-center">
                  {new Date(invoice.invoice_date).toLocaleDateString()}
                </td>
                <td className="p-4 border border-green-700 text-center">{invoice.items_count}</td>
                <td className="p-4 border border-green-700 text-center">{invoice.total_amount} دج</td>
                <td className="p-4 border border-green-700 text-center">{invoice.paid_amount} دج</td>
                <td className="p-4 border border-green-700 text-center">{invoice.remaining} دج</td>
                <td className="p-4 border border-green-700 text-center">{invoice.supplier_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
