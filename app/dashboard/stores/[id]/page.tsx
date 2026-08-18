"use client";

import { useEffect, useState } from "react";
import CreateStoreInvoice from "@/app/Components/Stores/CreateStoreInvoice";
import EditStoreInvoice from "@/app/Components/Stores/EditStoreInvoice";
import AddPreviousDebtModal from "@/app/Components/Stores/AddPreviousDebtModal";
import AddStorePaymentModal from "@/app/Components/Stores/AddStorePaymentModal";

import {
  Store as StoreIcon,
  Package,
  FileText,
  Wallet,
  Plus,
  Eye,
  Pencil,
  Phone,
  MapPin,
  CalendarDays,
  CreditCard,
  ShoppingBag,
} from "lucide-react";

interface Store {
  id: number;
  name: string;
  phone: string;
  address: string;
  previous_balance: number;
  current_balance: number;
  notes: string;
}

type Tab = "products" | "invoices" | "payments";

interface Payment {
  id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes: string;
}

export default function StorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [store, setStore] = useState<Store | null>(null);

  const [tab, setTab] = useState<Tab>("products");

  const [invoices, setInvoices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [openCreateInvoice, setOpenCreateInvoice] =
    useState(false);

  const [openEditInvoice, setOpenEditInvoice] =
    useState(false);

  const [selectedInvoice, setSelectedInvoice] =
    useState<number | null>(null);

  const [openDebt, setOpenDebt] = useState(false);

  const [openPayment, setOpenPayment] =
    useState(false);

  useEffect(() => {
    async function load() {
      const { id } = await params;

      const res = await fetch(`/api/stores/${id}`);
      const data = await res.json();

      setStore(data);

      const details = await fetch(
        `/api/stores/${id}/details`
      );

      const result = await details.json();

      setInvoices(result.invoices);
      setProducts(result.products);

      const paymentsRes = await fetch(
        `/api/stores/${id}/payments`
      );

      const paymentsData = await paymentsRes.json();

      setPayments(paymentsData);
    }

    load();
  }, [params]);

  async function refreshStoreData() {
    if (!store) return;

    const details = await fetch(
      `/api/stores/${store.id}/details`
    );

    const result = await details.json();

    setInvoices(result.invoices);
    setProducts(result.products);

    const paymentsRes = await fetch(
      `/api/stores/${store.id}/payments`
    );

    const paymentsData = await paymentsRes.json();

    setPayments(paymentsData);

    const storeRes = await fetch(
      `/api/stores/${store.id}`
    );

    const storeData = await storeRes.json();

    setStore(storeData);
  }

  if (!store) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-slate-50 flex items-center justify-center"
      >
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

          <p className="text-sm text-slate-500">
            جاري تحميل بيانات المحل...
          </p>

        </div>
      </div>
    );
  }

  /* =========================
     الحسابات
  ========================= */

  const totalProducts = products.length;

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
    Number(store.previous_balance || 0) +
    totalInvoiceDebt -
    totalPayments;

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
              <StoreIcon size={28} />
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-3">

                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  {store.name}
                </h1>

                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                  محل #{store.id}
                </span>

              </div>

              <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">

                {store.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={15} />
                    {store.phone}
                  </span>
                )}

                {store.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} />
                    {store.address}
                  </span>
                )}

              </div>

            </div>

          </div>

          <button
            onClick={() =>
              setOpenCreateInvoice(true)
            }
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
          >
            <Plus size={19} />
            فاتورة جديدة
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
                  إجمالي الدين المستحق
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
                  الدين السابق
                </p>

                <button
                  onClick={() =>
                    setOpenDebt(true)
                  }
                  className="mt-2 text-right text-2xl font-bold text-emerald-600 transition hover:text-emerald-700 sm:text-3xl"
                >
                  {formatMoney(
                    store.previous_balance
                  )}{" "}
                  دج
                </button>

                <p className="mt-1 text-xs text-slate-400">
                  اضغط لإضافة أو تعديل الدين
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet size={22} />
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
                  منتج داخل المحل
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
                  فواتير المحل
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
            TABS
        ===================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 bg-white px-4 sm:px-6">

            <div className="flex overflow-x-auto">

              <button
                onClick={() =>
                  setTab("products")
                }
                className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition ${
                  tab === "products"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Package size={17} />
                المنتجات
              </button>

              <button
                onClick={() =>
                  setTab("invoices")
                }
                className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition ${
                  tab === "invoices"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <FileText size={17} />
                الفواتير
              </button>

              <button
                onClick={() =>
                  setTab("payments")
                }
                className={`flex shrink-0 items-center gap-2 border-b-2 px-5 py-4 text-sm font-semibold transition ${
                  tab === "payments"
                    ? "border-emerald-600 text-emerald-600"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <CreditCard size={17} />
                الدفعات
              </button>

            </div>

          </div>

          <div className="p-4 sm:p-6">

            {/* =================================================
                PRODUCTS
            ================================================= */}

            {tab === "products" && (
              <div>

                <div className="mb-5">

                  <h2 className="text-lg font-bold text-slate-900">
                    منتجات المحل
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    المنتجات والكميات والأسعار الحالية
                  </p>

                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">

                  <table className="w-full min-w-[700px] text-right">

                    <thead className="bg-slate-50">

                      <tr className="border-b border-slate-200">

                        <th className="px-5 py-4 text-xs font-bold text-slate-500">
                          المنتج
                        </th>

                        <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                          الكمية
                        </th>

                        <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                          سعر الشراء
                        </th>

                        <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                          سعر البيع
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {products.length === 0 ? (

                        <tr>

                          <td
                            colSpan={4}
                            className="px-5 py-14 text-center"
                          >

                            <div className="flex flex-col items-center">

                              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                <Package size={24} />
                              </div>

                              <p className="text-sm font-semibold text-slate-600">
                                لا توجد منتجات داخل المحل
                              </p>

                            </div>

                          </td>

                        </tr>

                      ) : (

                        products.map(
                          (item, index) => (

                            <tr
                              key={`${item.product_id}-${index}`}
                              className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                            >

                              <td className="px-5 py-4">

                                <div className="flex items-center gap-3">

                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <ShoppingBag size={17} />
                                  </div>

                                  <span className="font-semibold text-slate-800">
                                    {item.product_name}
                                  </span>

                                </div>

                              </td>

                              <td className="px-5 py-4 text-center">

                                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">
                                  {item.quantity}
                                </span>

                              </td>

                              <td className="px-5 py-4 text-center">

                                <span className="font-semibold text-emerald-600">
                                  {formatMoney(
                                    item.purchase_price
                                  )}{" "}
                                  دج
                                </span>

                              </td>

                              <td className="px-5 py-4 text-center">

                                <span className="font-bold text-blue-600">
                                  {formatMoney(
                                    item.selling_price
                                  )}{" "}
                                  دج
                                </span>

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

            {tab === "invoices" && (
              <div>

                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      فواتير المحل
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      جميع فواتير البيع الخاصة بهذا المحل
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setOpenCreateInvoice(true)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    <Plus size={17} />
                    فاتورة جديدة
                  </button>

                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">

                  <table className="w-full min-w-[900px] text-right">

                    <thead className="bg-slate-50">

                      <tr className="border-b border-slate-200">

                        <th className="px-4 py-4 text-xs font-bold text-slate-500">
                          رقم الفاتورة
                        </th>

                        <th className="px-4 py-4 text-xs font-bold text-slate-500">
                          التاريخ
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
                          الإجراء
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {invoices.length === 0 ? (

                        <tr>

                          <td
                            colSpan={7}
                            className="px-5 py-14 text-center"
                          >

                            <div className="flex flex-col items-center">

                              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                <FileText size={24} />
                              </div>

                              <p className="text-sm font-semibold text-slate-600">
                                لا توجد فواتير
                              </p>

                            </div>

                          </td>

                        </tr>

                      ) : (

                        invoices.map(
                          (invoice) => (

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

                              <td className="px-4 py-4 text-sm font-bold text-slate-800">
                                {formatMoney(
                                  invoice.total
                                )}{" "}
                                دج
                              </td>

                              <td className="px-4 py-4 text-sm font-semibold text-emerald-600">
                                {formatMoney(
                                  invoice.paid
                                )}{" "}
                                دج
                              </td>

                              <td className="px-4 py-4 text-sm font-bold text-red-600">
                                {formatMoney(
                                  invoice.remaining
                                )}{" "}
                                دج
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

                                <div className="flex justify-center">

                                  <button
                                    onClick={() => {
                                      setSelectedInvoice(
                                        invoice.id
                                      );

                                      setOpenEditInvoice(
                                        true
                                      );
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-100"
                                  >
                                    <Pencil size={14} />
                                    تعديل
                                  </button>

                                </div>

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
                PAYMENTS
            ================================================= */}

            {tab === "payments" && (
              <div>

                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h2 className="text-lg font-bold text-slate-900">
                      دفعات المحل
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      جميع الدفعات المسجلة لهذا المحل
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      setOpenPayment(true)
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    <Plus size={17} />
                    إضافة دفعة
                  </button>

                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">

                  <table className="w-full min-w-[650px] text-right">

                    <thead className="bg-slate-50">

                      <tr className="border-b border-slate-200">

                        <th className="px-5 py-4 text-xs font-bold text-slate-500">
                          التاريخ
                        </th>

                        <th className="px-5 py-4 text-xs font-bold text-slate-500">
                          المبلغ
                        </th>

                        <th className="px-5 py-4 text-xs font-bold text-slate-500">
                          طريقة الدفع
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
                            colSpan={4}
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

                        payments.map(
                          (payment) => (

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
                                  {formatMoney(
                                    payment.amount
                                  )}{" "}
                                  دج
                                </span>

                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {payment.payment_method ||
                                  "-"}
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-600">
                                {payment.notes || "-"}
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

          </div>

        </div>

      </div>

      {/* =====================================================
          MODALS
      ===================================================== */}

      <CreateStoreInvoice
        open={openCreateInvoice}
        onClose={() =>
          setOpenCreateInvoice(false)
        }
        storeId={store.id}
        onSuccess={async () => {
          setOpenCreateInvoice(false);
          await refreshStoreData();
        }}
      />

      <EditStoreInvoice
        open={openEditInvoice}
        onClose={() => {
          setOpenEditInvoice(false);
          setSelectedInvoice(null);
        }}
        storeId={store.id}
        invoiceId={selectedInvoice as number}
        onSuccess={async () => {
          setOpenEditInvoice(false);
          setSelectedInvoice(null);
          await refreshStoreData();
        }}
      />

      <AddPreviousDebtModal
        open={openDebt}
        onClose={() =>
          setOpenDebt(false)
        }
        storeId={store.id}
        onSuccess={async () => {
          const res = await fetch(
            `/api/stores/${store.id}`
          );

          const data = await res.json();

          setStore(data);
        }}
      />

      <AddStorePaymentModal
        open={openPayment}
        onClose={() => {
          setOpenPayment(false);
        }}
        storeId={store.id}
        onSuccess={async () => {
          setOpenPayment(false);

          const res = await fetch(
            `/api/stores/${store.id}/payments`
          );

          const data = await res.json();

          setPayments(data);

          const storeRes = await fetch(
            `/api/stores/${store.id}`
          );

          const storeData =
            await storeRes.json();

          setStore(storeData);
        }}
      />

    </div>
  );
}