"use client";

import { useEffect, useState } from "react";
import {
  Trash2,
  Pencil,
  MoreVertical,
  Plus,
  CalendarDays,
  FileText,
  Package,
  Search,
  Filter,
} from "lucide-react";

import CreateInvoiceModal from "../../Components/popup/CreateInvoiceModal";
import InvoiceDetailsModal from "../../Components/popup/InvoiceDetailsModal";
import DeleteInvoiceModal from "../../Components/popup/DeleteInvoiceModal";
import EditInvoiceModal from "../../Components/popup/EditInvoiceModal";

interface Invoice {
  id: number;
  invoice_date: string;
  total_amount: number;
  paid_amount: number;
  remaining: number;
  supplier_name: string;
  items_count: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] =
    useState<number | null>(null);

  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // الفلترة حسب التاريخ
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* =========================
     تحميل الفواتير
  ========================= */

  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();

      setInvoices(data);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  /* =========================
     تنسيق المبالغ
  ========================= */

  const formatMoney = (value: number | string) => {
    return Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /* =========================
     فلترة التاريخ
  ========================= */

  const filteredInvoices = invoices.filter((invoice) => {
    if (!startDate && !endDate) return true;

    const invoiceDate = new Date(invoice.invoice_date);
    invoiceDate.setHours(0, 0, 0, 0);

    const start = startDate
      ? new Date(startDate)
      : null;

    const end = endDate
      ? new Date(endDate)
      : null;

    if (start) {
      start.setHours(0, 0, 0, 0);
    }

    if (end) {
      end.setHours(0, 0, 0, 0);
    }

    if (start && end) {
      return invoiceDate >= start && invoiceDate <= end;
    }

    if (start) {
      return invoiceDate >= start;
    }

    if (end) {
      return invoiceDate <= end;
    }

    return true;
  });

  /* =========================
     إحصائيات
  ========================= */

  const totalInvoices = filteredInvoices.length;

  const totalAmount = filteredInvoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.total_amount || 0),
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

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <FileText size={28} />
            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                إدارة الفواتير
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                إدارة ومتابعة جميع فواتير الشراء
              </p>

            </div>

          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
          >
            <Plus size={19} />
            إضافة فاتورة جديدة
          </button>

        </div>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* عدد الفواتير */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  عدد الفواتير
                </p>

                <h2 className="mt-2 text-3xl font-bold text-blue-600">
                  {totalInvoices}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  فاتورة ضمن الفلترة الحالية
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FileText size={22} />
              </div>

            </div>

          </div>

          {/* إجمالي الفواتير */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  إجمالي قيمة الفواتير
                </p>

                <h2 className="mt-2 text-2xl font-bold text-emerald-600 sm:text-3xl">
                  {formatMoney(totalAmount)}{" "}
                  <span className="text-sm">دج</span>
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  مجموع الفواتير المعروضة
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Package size={22} />
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            FILTER
        ===================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-4 flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Filter size={18} />
            </div>

            <div>

              <h2 className="text-sm font-bold text-slate-800">
                فلترة الفواتير
              </h2>

              <p className="text-xs text-slate-400">
                اختر فترة زمنية لعرض الفواتير
              </p>

            </div>

          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">

            {/* من */}

            <div className="flex-1">

              <label className="mb-2 block text-xs font-semibold text-slate-600">
                من تاريخ
              </label>

              <div className="relative">

                <CalendarDays
                  size={17}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  value={startDate}
                  onChange={(e) =>
                    setStartDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-10 pl-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />

              </div>

            </div>

            {/* إلى */}

            <div className="flex-1">

              <label className="mb-2 block text-xs font-semibold text-slate-600">
                إلى تاريخ
              </label>

              <div className="relative">

                <CalendarDays
                  size={17}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  value={endDate}
                  onChange={(e) =>
                    setEndDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-10 pl-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />

              </div>

            </div>

            {/* مسح */}

            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                }}
                className="rounded-xl bg-red-50 px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100"
              >
                مسح الفلترة
              </button>
            )}

          </div>

        </div>

        {/* =====================================================
            TABLE
        ===================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* عنوان الجدول */}

          <div className="flex flex-col gap-2 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                قائمة الفواتير
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredInvoices.length} فاتورة معروضة
              </p>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-right">

              <thead className="bg-slate-50">

                <tr className="border-b border-slate-200">

                  <th className="px-5 py-4 text-xs font-bold text-slate-500">
                    رقم الفاتورة
                  </th>

                  <th className="px-5 py-4 text-xs font-bold text-slate-500">
                    تاريخ الفاتورة
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                    عدد المنتجات
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                    إجمالي الفاتورة
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                    التفاصيل
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredInvoices.length === 0 ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="px-5 py-16 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <Search size={25} />
                        </div>

                        <p className="text-sm font-bold text-slate-600">
                          لا توجد فواتير للعرض
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          حاول تغيير فترة البحث
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  filteredInvoices.map((invoice) => (

                    <tr
                      key={invoice.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                    >

                      {/* رقم الفاتورة */}

                      <td className="px-5 py-4">

                        <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">

                          <FileText size={14} />

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
                          ).toLocaleDateString("fr-CA")}

                        </div>

                      </td>

                      {/* عدد المنتجات */}

                      <td className="px-5 py-4 text-center">

                        <span className="inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-600">
                          {invoice.items_count}
                        </span>

                      </td>

                      {/* المبلغ */}

                      <td className="px-5 py-4 text-center">

                        <span className="font-bold text-emerald-600">
                          {formatMoney(
                            invoice.total_amount
                          )}{" "}
                          دج
                        </span>

                      </td>

                      {/* الإجراءات */}

                      <td className="px-5 py-4">

                        <div className="flex justify-center gap-2">

                          {/* حذف */}

                          <button
                            title="حذف الفاتورة"
                            onClick={() => {
                              setSelectedInvoiceId(
                                invoice.id
                              );
                              setShowDelete(true);
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={16} />
                          </button>

                          {/* تعديل */}

                          <button
                            title="تعديل الفاتورة"
                            onClick={() => {
                              setSelectedInvoiceId(
                                invoice.id
                              );
                              setShowEdit(true);
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                          >
                            <Pencil size={16} />
                          </button>

                          {/* التفاصيل */}

                          <button
                            title="تفاصيل الفاتورة"
                            onClick={() => {
                              setSelectedInvoiceId(
                                invoice.id
                              );
                              setShowDetails(true);
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition hover:bg-slate-200"
                          >
                            <MoreVertical size={17} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* =====================================================
          MODALS
      ===================================================== */}

      {showModal && (
        <CreateInvoiceModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchInvoices}
        />
      )}

      {showDetails && selectedInvoiceId && (
        <InvoiceDetailsModal
          invoice={invoices.find(
            (inv) => inv.id === selectedInvoiceId
          )}
          onClose={() => setShowDetails(false)}
        />
      )}

      {showDelete && selectedInvoiceId && (
        <DeleteInvoiceModal
          invoiceId={selectedInvoiceId}
          onClose={() => setShowDelete(false)}
          onSuccess={fetchInvoices}
        />
      )}

      {showEdit && selectedInvoiceId && (
        <EditInvoiceModal
          invoiceId={selectedInvoiceId}
          onClose={() => setShowEdit(false)}
          onSuccess={fetchInvoices}
        />
      )}

    </div>
  );
}