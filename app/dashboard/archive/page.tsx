"use client";

import { useEffect, useState } from "react";
import {
  Archive,
  CalendarDays,
  FileText,
  Package,
  Wallet,
  Search,
  TrendingUp,
} from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  const currentYear = new Date().getFullYear();

  /* =========================
     جلب الفواتير
  ========================= */

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        let url = `/api/invoices?beforeYear=${currentYear}`;

        if (selectedYear) {
          url += `&year=${selectedYear}`;
        }

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error("فشل تحميل الأرشيف");
        }

        const data = await res.json();

        setInvoices(data);
      } catch (err) {
        console.error(
          "Failed to fetch archived invoices:",
          err
        );

        setInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, currentYear]);

  /* =========================
     السنوات
  ========================= */

  const archivedYears = Array.from(
    { length: 5 },
    (_, i) => currentYear - i - 1
  );

  /* =========================
     تنسيق المبالغ
     مثال: 1000.00
  ========================= */

  const formatMoney = (
    value: number | string | null | undefined
  ) => {
    return Number(value || 0).toFixed(2);
  };

  /* =========================
     الإحصائيات
  ========================= */

  const totalInvoices = invoices.length;

  const totalProducts = invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.items_count || 0),
    0
  );

  const totalAmount = invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.total_amount || 0),
    0
  );

  const totalPaid = invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.paid_amount || 0),
    0
  );

  const totalRemaining = invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.remaining || 0),
    0
  );

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8"
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Archive size={28} />
            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                أرشيف الفواتير
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                عرض وإدارة فواتير السنوات السابقة
              </p>

            </div>

          </div>

          {/* فلتر السنة */}

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm border border-slate-200">
              <CalendarDays size={18} />
            </div>

            <select
              value={selectedYear || ""}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value
                    ? Number(e.target.value)
                    : null
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="">
                جميع السنوات
              </option>

              {archivedYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

          </div>

        </div>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* عدد الفواتير */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  عدد الفواتير
                </p>

                <h2 className="mt-2 text-2xl font-bold text-blue-600 sm:text-3xl">
                  {totalInvoices}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  الفواتير المؤرشفة
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText size={22} />
              </div>

            </div>

          </div>

          {/* عدد المنتجات */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  عدد المنتجات
                </p>

                <h2 className="mt-2 text-2xl font-bold text-purple-600 sm:text-3xl">
                  {totalProducts}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  مجموع المنتجات في الفواتير
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Package size={22} />
              </div>

            </div>

          </div>

          {/* الإجمالي */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  إجمالي الفواتير
                </p>

                <h2 className="mt-2 text-xl font-bold text-emerald-600 sm:text-2xl">
                  {formatMoney(totalAmount)} دج
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  قيمة جميع الفواتير
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp size={22} />
              </div>

            </div>

          </div>

          {/* المتبقي */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  إجمالي المتبقي
                </p>

                <h2 className="mt-2 text-xl font-bold text-red-600 sm:text-2xl">
                  {formatMoney(totalRemaining)} دج
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  المبالغ غير المدفوعة
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Wallet size={22} />
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            TABLE CARD
        ===================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* عنوان الجدول */}

          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                الفواتير المؤرشفة
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {selectedYear
                  ? `عرض فواتير سنة ${selectedYear}`
                  : "عرض جميع الفواتير من السنوات السابقة"}
              </p>

            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">

              <Search size={15} />

              {invoices.length} فاتورة

            </div>

          </div>

          {/* الجدول */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px] text-right">

              <thead className="bg-slate-50">

                <tr className="border-b border-slate-200">

                  <th className="px-5 py-4 text-xs font-bold text-slate-500">
                    رقم الفاتورة
                  </th>

                  <th className="px-5 py-4 text-xs font-bold text-slate-500">
                    التاريخ
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                    عدد المنتجات
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                    الإجمالي
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                    المدفوع
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                    المتبقي
                  </th>

                  <th className="px-5 py-4 text-xs font-bold text-slate-500">
                    المورد
                  </th>

                </tr>

              </thead>

              <tbody>

                {/* التحميل */}

                {loading ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

                        <p className="text-sm text-slate-500">
                          جاري تحميل الأرشيف...
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : invoices.length === 0 ? (

                  /* لا توجد بيانات */

                  <tr>

                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <Archive size={26} />
                        </div>

                        <p className="text-sm font-bold text-slate-600">
                          لا توجد فواتير مؤرشفة
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          لا توجد فواتير للسنة المحددة
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  invoices.map((invoice) => (

                    <tr
                      key={invoice.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                    >

                      {/* رقم الفاتورة */}

                      <td className="px-5 py-4">

                        <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                          #{invoice.id}
                        </span>

                      </td>

                      {/* التاريخ */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-600">

                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />

                          {new Date(
                            invoice.invoice_date
                          ).toLocaleDateString(
                            "fr-CA"
                          )}

                        </div>

                      </td>

                      {/* المنتجات */}

                      <td className="px-5 py-4 text-center">

                        <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                          {invoice.items_count}
                        </span>

                      </td>

                      {/* الإجمالي */}

                      <td className="px-5 py-4 text-center">

                        <span className="font-bold text-slate-800">
                          {formatMoney(
                            invoice.total_amount
                          )}{" "}
                          دج
                        </span>

                      </td>

                      {/* المدفوع */}

                      <td className="px-5 py-4 text-center">

                        <span className="font-semibold text-emerald-600">
                          {formatMoney(
                            invoice.paid_amount
                          )}{" "}
                          دج
                        </span>

                      </td>

                      {/* المتبقي */}

                      <td className="px-5 py-4 text-center">

                        <span
                          className={`font-bold ${
                            Number(invoice.remaining) >
                            0
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {formatMoney(
                            invoice.remaining
                          )}{" "}
                          دج
                        </span>

                      </td>

                      {/* المورد */}

                      <td className="px-5 py-4">

                        <span className="text-sm font-medium text-slate-700">
                          {invoice.supplier_name ||
                            "-"}
                        </span>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* =====================================================
            FOOTER SUMMARY
        ===================================================== */}

        {!loading && invoices.length > 0 && (

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

              <p className="text-xs font-medium text-slate-400">
                إجمالي الفواتير
              </p>

              <p className="mt-1 text-lg font-bold text-slate-800">
                {formatMoney(totalAmount)} دج
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

              <p className="text-xs font-medium text-slate-400">
                إجمالي المدفوع
              </p>

              <p className="mt-1 text-lg font-bold text-emerald-600">
                {formatMoney(totalPaid)} دج
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

              <p className="text-xs font-medium text-slate-400">
                إجمالي المتبقي
              </p>

              <p className="mt-1 text-lg font-bold text-red-600">
                {formatMoney(totalRemaining)} دج
              </p>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}