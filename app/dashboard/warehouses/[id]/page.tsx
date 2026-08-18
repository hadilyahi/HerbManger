"use client";

import { useEffect, useState } from "react";
import AddWarehouseInvoiceModal from "@/app/Components/Warehouses/AddWarehouseInvoiceModal";
import ProductHistoryModal from "@/app/Components/Warehouses/ProductHistoryModal";
import AddPaymentModal from "@/app/Components/Warehouses/AddPaymentModal";

import {
  Warehouse as WarehouseIcon,
  Package,
  FileText,
  Wallet,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Phone,
  MapPin,
  CalendarDays,
  TrendingDown,
  CreditCard,
} from "lucide-react";

interface Warehouse {
  id: number;
  name: string;
  phone: string;
  address: string;
  previous_balance: number;
  notes: string;
}

interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  supplier: string;
  total: number;
  paid: number;
  remaining: number;
  status: string;
}

interface WarehouseProduct {
  id: number;
  name: string;
  quantity: number;
  last_purchase_price: number;
}

interface ProductHistory {
  id: number;
  invoice_number: string;
  invoice_date: string;
  supplier: string;
  quantity: number;
  purchase_price: number;
}

interface Payment {
  id: number;
  amount: number;
  payment_date: string;
  notes: string;
}

export default function WarehousePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<WarehouseProduct[]>([]);
  const [history, setHistory] = useState<ProductHistory[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [selectedProduct, setSelectedProduct] =
    useState<WarehouseProduct | null>(null);

  const [openHistory, setOpenHistory] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "products" | "invoices" | "payments"
  >("products");

  const [productSearch, setProductSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [openInvoiceModal, setOpenInvoiceModal] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] =
    useState<number | null>(null);

  const [openPaymentModal, setOpenPaymentModal] =
    useState(false);

  const [openPreviousDebt, setOpenPreviousDebt] =
    useState(false);

  const [previousDebt, setPreviousDebt] = useState("");

  async function loadInvoices(id: string) {
    const res = await fetch(
      `/api/warehouses/${id}/invoices`
    );

    const data = await res.json();

    setInvoices(data);
  }

  async function loadProducts(id: string) {
    const res = await fetch(
      `/api/warehouses/${id}/products`
    );

    const data = await res.json();

    setProducts(data);
  }

  async function loadHistory(productId: number) {
    const { id } = await params;

    const res = await fetch(
      `/api/warehouses/${id}/products/${productId}/history`
    );

    const data = await res.json();

    setHistory(data);
  }

  async function loadPayments(id: string) {
    const res = await fetch(
      `/api/warehouses/${id}/payments`
    );

    const data = await res.json();

    setPayments(data);
  }

  useEffect(() => {
    async function load() {
      const { id } = await params;

      const res = await fetch(`/api/warehouses/${id}`);
      const data = await res.json();

      setWarehouse(data);

      await loadInvoices(id);
      await loadProducts(id);
      await loadPayments(id);
    }

    load();
  }, [params]);

  if (!warehouse) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-slate-50 flex items-center justify-center"
      >
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="text-sm text-slate-500">
            جاري تحميل بيانات المخزن...
          </p>

        </div>
      </div>
    );
  }

  /* =========================
     الحسابات
  ========================= */

  const totalProducts = products.length;

  const stockValue = products.reduce(
    (sum, product) =>
      sum +
      Number(product.quantity) *
        Number(product.last_purchase_price),
    0
  );

  const totalInvoices = invoices.length;

  const totalInvoiceDebt = invoices.reduce(
    (sum, invoice) =>
      sum + Number(invoice.remaining || 0),
    0
  );

  const totalPayments = payments.reduce(
    (sum, payment) =>
      sum + Number(payment.amount || 0),
    0
  );

  const currentDebt =
    Number(warehouse.previous_balance || 0) +
    totalInvoiceDebt -
    totalPayments;

  async function deleteInvoice(id: number) {
    if (!confirm("هل تريد حذف الفاتورة؟")) return;

    const res = await fetch(
      `/api/warehouse-invoices/${id}`,
      {
        method: "DELETE",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    const { id: warehouseId } = await params;

    await loadInvoices(warehouseId);
    await loadProducts(warehouseId);
  }

  const filteredProducts = products.filter((product) =>
    product.name
      .toLowerCase()
      .includes(productSearch.toLowerCase())
  );
  const formatMoney = (value: number | string) => {
  return Number(value || 0).toFixed(2);
};
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8"
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <WarehouseIcon size={28} />
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {warehouse.name}
                </h1>

                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                  مخزن #{warehouse.id}
                </span>

              </div>

              <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">

                {warehouse.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={15} />
                    {warehouse.phone}
                  </span>
                )}

                {warehouse.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} />
                    {warehouse.address}
                  </span>
                )}

              </div>

            </div>

          </div>

          <button
            onClick={() => {
              setEditingInvoiceId(null);
              setOpenInvoiceModal(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
          >
            <Plus size={19} />
            فاتورة شراء جديدة
          </button>

        </div>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* الدين الحالي */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  الدين الحالي
                </p>

                <h2 className="mt-2 text-2xl font-bold text-red-600 sm:text-3xl">
                 {formatMoney(currentDebt)} دج
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  دين المخزن الحالي
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Wallet size={22} />
              </div>

            </div>

          </div>

          {/* الدين السابق */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  الرصيد السابق
                </p>

                <button
                  onClick={() => {
                    setPreviousDebt(
                      String(
                        warehouse.previous_balance
                      )
                    );

                    setOpenPreviousDebt(true);
                  }}
                  className="mt-2 text-right text-2xl font-bold text-emerald-600 transition hover:text-emerald-700 sm:text-3xl"
                >
                  {formatMoney(warehouse.previous_balance)} دج
                </button>

                <p className="mt-1 text-xs text-slate-400">
                  اضغط للتعديل
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingDown size={22} />
              </div>

            </div>

          </div>

          {/* المنتجات */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  عدد المنتجات
                </p>

                <h2 className="mt-2 text-2xl font-bold text-blue-600 sm:text-3xl">
                  {totalProducts}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  منتج داخل المخزن
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Package size={22} />
              </div>

            </div>

          </div>

          {/* الفواتير */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  فواتير الشراء
                </p>

                <h2 className="mt-2 text-2xl font-bold text-purple-600 sm:text-3xl">
                  {totalInvoices}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  إجمالي الفواتير
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <FileText size={22} />
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            TABS + CONTENT
        ===================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Tabs */}

          <div className="border-b border-slate-200 bg-white px-4 sm:px-6">

            <div className="flex overflow-x-auto">

              <button
                onClick={() => setActiveTab("products")}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition ${
                  activeTab === "products"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Package size={17} />
                المنتجات
              </button>

              <button
                onClick={() => setActiveTab("invoices")}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition ${
                  activeTab === "invoices"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText size={17} />
                فواتير الشراء
              </button>

              <button
                onClick={() => setActiveTab("payments")}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition ${
                  activeTab === "payments"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <CreditCard size={17} />
                المدفوعات
              </button>

            </div>

          </div>

          <div className="p-4 sm:p-6">

            {/* =================================================
                PRODUCTS
            ================================================= */}

            {activeTab === "products" && (
              <div>

                {/* عنوان + بحث */}

                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      منتجات المخزن
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      عرض المنتجات والكميات والأسعار الحالية
                    </p>

                  </div>

                  <div className="relative w-full sm:w-80">

                    <Search
                      size={18}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) =>
                        setProductSearch(e.target.value)
                      }
                      placeholder="ابحث عن منتج..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-10 pl-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />

                  </div>

                </div>

                {/* عدد النتائج */}

                <div className="mb-4 flex items-center justify-between">

                  <span className="text-xs text-slate-400">
                    {filteredProducts.length} منتج
                  </span>

                  {productSearch && (
                    <button
                      onClick={() => setProductSearch("")}
                      className="text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      مسح البحث
                    </button>
                  )}

                </div>

                {/* جدول المنتجات */}

                <div className="overflow-x-auto rounded-xl border border-slate-200">

                  <table className="w-full min-w-[750px] text-right">

                    <thead className="bg-slate-50">

                      <tr className="border-b border-slate-200">

                        <th className="px-5 py-4 text-xs font-bold text-slate-500">
                          المنتج
                        </th>

                        <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                          الكمية
                        </th>

                        <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                          آخر سعر شراء
                        </th>

                        <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                          قيمة المخزون
                        </th>

                        <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                          الإجراءات
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {filteredProducts.length === 0 ? (

                        <tr>

                          <td
                            colSpan={5}
                            className="px-5 py-14 text-center"
                          >

                            <div className="flex flex-col items-center">

                              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                <Package size={24} />
                              </div>

                              <p className="text-sm font-semibold text-slate-600">
                                {productSearch
                                  ? "لا توجد منتجات مطابقة للبحث"
                                  : "لا توجد منتجات داخل هذا المخزن"}
                              </p>

                            </div>

                          </td>

                        </tr>

                      ) : (

                        filteredProducts.map(
                          (product) => (

                            <tr
                              key={product.id}
                              className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                            >

                              <td className="px-5 py-4">

                                <div className="flex items-center gap-3">

                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Package size={17} />
                                  </div>

                                  <span className="font-semibold text-slate-800">
                                    {product.name}
                                  </span>

                                </div>

                              </td>

                              <td className="px-5 py-4 text-center">

                                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
                                  {product.quantity}
                                </span>

                              </td>

                              <td className="px-5 py-4 text-center">

                                <span className="font-semibold text-emerald-600">
                                  {formatMoney(product.last_purchase_price)} دج
                                </span>

                              </td>

                              <td className="px-5 py-4 text-center">

                                <span className="font-bold text-slate-800">
                                  {formatMoney(
  Number(product.quantity) *
  Number(product.last_purchase_price)
)} دج
                                </span>

                              </td>

                              <td className="px-5 py-4 text-center">

                                <button
                                  onClick={async () => {
                                    setSelectedProduct(
                                      product
                                    );

                                    await loadHistory(
                                      product.id
                                    );

                                    setOpenHistory(true);
                                  }}
                                  className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                                >
                                  <Eye size={15} />
                                  التفاصيل
                                </button>

                              </td>

                            </tr>

                          )
                        )

                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            )}

            {/* =================================================
                INVOICES
            ================================================= */}

            {activeTab === "invoices" && (
              <div>

                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      فواتير الشراء
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      إدارة جميع فواتير شراء المخزن
                    </p>

                  </div>

                  <button
                    onClick={() => {
                      setEditingInvoiceId(null);
                      setOpenInvoiceModal(true);
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    <Plus size={17} />
                    فاتورة جديدة
                  </button>

                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">

                  <table className="w-full min-w-[950px] text-right">

                    <thead className="bg-slate-50">

                      <tr className="border-b border-slate-200">

                        <th className="px-4 py-4 text-xs font-bold text-slate-500">
                          رقم الفاتورة
                        </th>

                        <th className="px-4 py-4 text-xs font-bold text-slate-500">
                          التاريخ
                        </th>

                        <th className="px-4 py-4 text-xs font-bold text-slate-500">
                          المورد
                        </th>

                        <th className="px-4 py-4 text-xs font-bold text-slate-500">
                          الإجمالي
                        </th>

                        <th className="px-4 py-4 text-xs font-bold text-slate-500">
                          المدفوع
                        </th>

                        <th className="px-4 py-4 text-xs font-bold text-slate-500">
                          المتبقي
                        </th>

                        <th className="px-4 py-4 text-xs font-bold text-slate-500">
                          الحالة
                        </th>

                        <th className="px-4 py-4 text-center text-xs font-bold text-slate-500">
                          الإجراءات
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {invoices.length === 0 ? (

                        <tr>

                          <td
                            colSpan={8}
                            className="px-5 py-14 text-center"
                          >

                            <div className="flex flex-col items-center">

                              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                <FileText size={24} />
                              </div>

                              <p className="text-sm font-semibold text-slate-600">
                                لا توجد فواتير شراء
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

                            <td className="px-4 py-4">

                              <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                                {invoice.invoice_number}
                              </span>

                            </td>

                            <td className="px-4 py-4">

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

                            <td className="px-4 py-4 text-sm font-medium text-slate-700">
                              {invoice.supplier || "-"}
                            </td>

                            <td className="px-4 py-4 text-sm font-bold text-slate-800">
                              {formatMoney(invoice.total)} دج
                            </td>

                            <td className="px-4 py-4 text-sm font-semibold text-emerald-600">
                              {formatMoney(invoice.paid)} دج
                            </td>

                            <td className="px-4 py-4 text-sm font-bold text-red-600">
                              {formatMoney(invoice.remaining)} دج
                            </td>

                            <td className="px-4 py-4">

                              <span
                                className={`inline-flex rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                                  invoice.status ===
                                  "paid"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : invoice.status ===
                                      "partial"
                                    ? "bg-orange-50 text-orange-700"
                                    : "bg-red-50 text-red-700"
                                }`}
                              >
                                {invoice.status ===
                                "paid"
                                  ? "مدفوعة"
                                  : invoice.status ===
                                    "partial"
                                  ? "مدفوعة جزئياً"
                                  : "غير مدفوعة"}
                              </span>

                            </td>

                            <td className="px-4 py-4">

                              <div className="flex justify-center gap-2">

                                <button
                                  onClick={() => {
                                    setEditingInvoiceId(
                                      invoice.id
                                    );

                                    setOpenInvoiceModal(
                                      true
                                    );
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                                >
                                  <Pencil size={14} />
                                  تعديل
                                </button>

                                <button
                                  onClick={() =>
                                    deleteInvoice(
                                      invoice.id
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                                >
                                  <Trash2 size={14} />
                                  حذف
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
            )}

            {/* =================================================
                PAYMENTS
            ================================================= */}

            {activeTab === "payments" && (
              <div>

                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      المدفوعات
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      جميع الدفعات المسجلة لهذا المخزن
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setOpenPaymentModal(true)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    <Plus size={17} />
                    إضافة دفعة
                  </button>

                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">

                  <table className="w-full min-w-[600px] text-right">

                    <thead className="bg-slate-50">

                      <tr className="border-b border-slate-200">

                        <th className="px-5 py-4 text-xs font-bold text-slate-500">
                          التاريخ
                        </th>

                        <th className="px-5 py-4 text-xs font-bold text-slate-500">
                          المبلغ
                        </th>

                        <th className="px-5 py-4 text-xs font-bold text-slate-500">
                          ملاحظات
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {payments.length === 0 ? (

                        <tr>

                          <td
                            colSpan={3}
                            className="px-5 py-14 text-center"
                          >

                            <div className="flex flex-col items-center">

                              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                <CreditCard size={24} />
                              </div>

                              <p className="text-sm font-semibold text-slate-600">
                                لا توجد دفعات
                              </p>

                            </div>

                          </td>

                        </tr>

                      ) : (

                        payments.map((payment) => (

                          <tr
                            key={payment.id}
                            className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                          >

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-2 text-sm text-slate-600">

                                <CalendarDays
                                  size={15}
                                  className="text-slate-400"
                                />

                                {new Date(
                                  payment.payment_date
                                ).toLocaleDateString(
                                  "fr-CA"
                                )}

                              </div>

                            </td>

                            <td className="px-5 py-4">

                              <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-700">
                                {formatMoney(payment.amount)} دج
                              </span>

                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {payment.notes || "-"}
                            </td>

                          </tr>

                        ))

                      )}

                    </tbody>

                  </table>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* =====================================================
          MODALS
      ===================================================== */}

      <AddWarehouseInvoiceModal
        open={openInvoiceModal}
        warehouseId={warehouse.id}
        invoiceId={editingInvoiceId}
        onClose={() => {
          setOpenInvoiceModal(false);
          setEditingInvoiceId(null);
        }}
        onSuccess={async () => {
          setOpenInvoiceModal(false);
          setEditingInvoiceId(null);

          const { id } = await params;

          await loadInvoices(id);
          await loadProducts(id);
        }}
      />

      <ProductHistoryModal
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        productName={selectedProduct?.name || ""}
        history={history}
      />

      <AddPaymentModal
        open={openPaymentModal}
        warehouseId={warehouse.id}
        onClose={() =>
          setOpenPaymentModal(false)
        }
        onSuccess={async () => {
          setOpenPaymentModal(false);

          const { id } = await params;

          await loadPayments(id);
        }}
      />

      {/* =====================================================
          PREVIOUS DEBT MODAL
      ===================================================== */}

      {openPreviousDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet size={21} />
              </div>

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  تعديل الرصيد السابق
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  قم بإدخال قيمة الدين السابق للمخزن
                </p>

              </div>

            </div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              المبلغ
            </label>

            <div className="relative">

              <input
                type="number"
                value={previousDebt}
                onChange={(e) =>
                  setPreviousDebt(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-14 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                placeholder="0"
              />

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                دج
              </span>

            </div>

            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setOpenPreviousDebt(false)
                }
                className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                إلغاء
              </button>

              <button
                onClick={async () => {
                  const res = await fetch(
                    `/api/warehouses/${warehouse.id}/previous-balance`,
                    {
                      method: "PUT",
                      headers: {
                        "Content-Type":
                          "application/json",
                      },
                      body: JSON.stringify({
                        amount: previousDebt,
                      }),
                    }
                  );

                  if (res.ok) {
                    const data = await fetch(
                      `/api/warehouses/${warehouse.id}`
                    );

                    const warehouseData =
                      await data.json();

                    setWarehouse(
                      warehouseData
                    );

                    setOpenPreviousDebt(false);
                  }
                }}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                حفظ التعديل
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}