"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AddStoreModal from "@/app/Components/Stores/AddStoreModal";
import {
  Store as StoreIcon,
  Plus,
  Phone,
  Wallet,
  MapPin,
  ArrowLeft,
  TrendingUp,
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

interface StoreData extends Store {
  calculatedBalance: number;
}

interface Invoice {
  remaining: number;
}

interface Payment {
  amount: number;
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadStores() {
    try {
      setLoading(true);

      // جلب المحلات
      const res = await fetch("/api/stores");
      const data: Store[] = await res.json();

      // حساب الرصيد الحقيقي لكل محل
      const storesWithBalance: StoreData[] = await Promise.all(
        data.map(async (store) => {
          try {
            // جلب الفواتير
            const detailsRes = await fetch(
              `/api/stores/${store.id}/details`
            );

            const details = await detailsRes.json();

            const invoices: Invoice[] = details.invoices || [];

            // مجموع المتبقي من الفواتير
            const invoicesRemaining = invoices.reduce(
              (sum, invoice) =>
                sum + Number(invoice.remaining || 0),
              0
            );

            // جلب الدفعات المستقلة
            const paymentsRes = await fetch(
              `/api/stores/${store.id}/payments`
            );

            const payments: Payment[] =
              await paymentsRes.json();

            // مجموع الدفعات
            const totalPayments = payments.reduce(
              (sum, payment) =>
                sum + Number(payment.amount || 0),
              0
            );

            /*
              الرصيد الحالي:

              الدين السابق
              +
              المتبقي من جميع الفواتير
              -
              الدفعات المستقلة
            */

            const calculatedBalance =
              Number(store.previous_balance || 0) +
              invoicesRemaining -
              totalPayments;

            return {
              ...store,
              calculatedBalance,
            };
          } catch (error) {
            console.error(
              `خطأ في حساب رصيد المحل ${store.id}`,
              error
            );

            return {
              ...store,
              calculatedBalance: Number(
                store.previous_balance || 0
              ),
            };
          }
        })
      );

      setStores(storesWithBalance);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStores();
  }, []);

  /*
    إجمالي الدين الحالي لجميع المحلات
  */
  const totalCurrentBalance = stores.reduce(
    (sum, store) =>
      sum + Number(store.calculatedBalance || 0),
    0
  );

  /*
    إجمالي الدين السابق
  */
  const totalPreviousBalance = stores.reduce(
    (sum, store) =>
      sum + Number(store.previous_balance || 0),
    0
  );

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8"
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ================= HEADER ================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <StoreIcon size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                المحلات
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                إدارة المحلات ومتابعة الأرصدة والبيانات
              </p>
            </div>

          </div>

          <button
            onClick={() => setOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
          >
            <Plus size={19} />
            إضافة محل
          </button>

        </div>

        {/* ================= STATISTICS ================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* عدد المحلات */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  إجمالي المحلات
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stores.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <StoreIcon size={24} />
              </div>

            </div>

          </div>

          {/* الدين الحالي */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  إجمالي الدين الحالي
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {totalCurrentBalance.toLocaleString("ar-DZ")}

                  <span className="mr-1 text-sm font-medium text-slate-500">
                    دج
                  </span>
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Wallet size={23} />
              </div>

            </div>

          </div>

          {/* الدين السابق */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  إجمالي الدين السابق
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {totalPreviousBalance.toLocaleString("ar-DZ")}

                  <span className="mr-1 text-sm font-medium text-slate-500">
                    دج
                  </span>
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <TrendingUp size={23} />
              </div>

            </div>

          </div>

        </div>

        {/* ================= TABLE ================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  قائمة المحلات
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  الدين الحالي محسوب من الفواتير والدفعات والدين السابق
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {stores.length} محل
              </div>

            </div>

          </div>

          {/* ================= DESKTOP ================= */}

          <div className="hidden overflow-x-auto md:block">

            <table className="w-full text-right">

              <thead>

                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-6 py-4 text-xs font-bold text-slate-500">
                    #
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-slate-500">
                    اسم المحل
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-slate-500">
                    الهاتف
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-slate-500">
                    العنوان
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-slate-500">
                    الدين الحالي
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                    العملية
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="px-6 py-14 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

                        <p className="text-sm text-slate-500">
                          جاري حساب أرصدة المحلات...
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : stores.length === 0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <StoreIcon size={30} />
                        </div>

                        <h3 className="font-bold text-slate-800">
                          لا توجد محلات
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          قم بإضافة أول محل للبدء
                        </p>

                        <button
                          onClick={() => setOpen(true)}
                          className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                          <Plus size={17} />
                          إضافة محل
                        </button>

                      </div>

                    </td>

                  </tr>

                ) : (

                  stores.map((store) => (

                    <tr
                      key={store.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                    >

                      {/* ID */}

                      <td className="px-6 py-4">

                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                          {store.id}
                        </span>

                      </td>

                      {/* Store */}

                      <td className="px-6 py-4">

                        <Link
                          href={`/dashboard/stores/${store.id}`}
                          className="group flex items-center gap-3"
                        >

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                            <StoreIcon size={19} />
                          </div>

                          <div>

                            <p className="font-bold text-slate-800 transition group-hover:text-emerald-600">
                              {store.name}
                            </p>

                            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                              فتح تفاصيل المحل
                              <ArrowLeft size={12} />
                            </p>

                          </div>

                        </Link>

                      </td>

                      {/* Phone */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-600">

                          <Phone
                            size={16}
                            className="text-slate-400"
                          />

                          {store.phone || "-"}

                        </div>

                      </td>

                      {/* Address */}

                      <td className="px-6 py-4">

                        <div className="flex max-w-[200px] items-center gap-2 text-sm text-slate-600">

                          <MapPin
                            size={16}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="truncate">
                            {store.address || "-"}
                          </span>

                        </div>

                      </td>

                      {/* Current Debt */}

                      <td className="px-6 py-4">

                        <span
                          className={`inline-flex items-center rounded-lg px-3 py-1.5 font-bold ${
                            store.calculatedBalance > 0
                              ? "bg-red-50 text-red-700"
                              : store.calculatedBalance < 0
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >

                          {Number(
                            store.calculatedBalance
                          ).toLocaleString("ar-DZ")}

                          <span className="mr-1 text-xs font-medium">
                            دج
                          </span>

                        </span>

                      </td>

                      {/* Action */}

                      <td className="px-6 py-4">

                        <div className="flex justify-center">

                          <Link
                            href={`/dashboard/stores/${store.id}`}
                            className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100"
                          >
                            فتح
                            <ArrowLeft size={15} />
                          </Link>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

          {/* ================= MOBILE ================= */}

          <div className="divide-y divide-slate-100 md:hidden">

            {loading ? (

              <div className="flex flex-col items-center justify-center px-5 py-14">

                <div className="mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

                <p className="text-sm text-slate-500">
                  جاري حساب أرصدة المحلات...
                </p>

              </div>

            ) : stores.length === 0 ? (

              <div className="px-5 py-14 text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <StoreIcon size={27} />
                </div>

                <p className="font-bold text-slate-800">
                  لا توجد محلات
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  قم بإضافة أول محل للبدء
                </p>

              </div>

            ) : (

              stores.map((store) => (

                <div
                  key={store.id}
                  className="p-5 transition hover:bg-slate-50"
                >

                  <div className="flex items-start justify-between gap-3">

                    <Link
                      href={`/dashboard/stores/${store.id}`}
                      className="flex min-w-0 items-center gap-3"
                    >

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <StoreIcon size={21} />
                      </div>

                      <div className="min-w-0">

                        <h3 className="truncate font-bold text-slate-800">
                          {store.name}
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-400">
                          محل #{store.id}
                        </p>

                      </div>

                    </Link>

                    <div
                      className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-bold ${
                        store.calculatedBalance > 0
                          ? "bg-red-50 text-red-700"
                          : store.calculatedBalance < 0
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {Number(
                        store.calculatedBalance
                      ).toLocaleString("ar-DZ")}{" "}
                      دج
                    </div>

                  </div>

                  <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-3">

                    <div className="flex items-center gap-2 text-sm text-slate-600">

                      <Phone
                        size={15}
                        className="text-slate-400"
                      />

                      {store.phone || "لا يوجد هاتف"}

                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">

                      <MapPin
                        size={15}
                        className="text-slate-400"
                      />

                      {store.address || "لا يوجد عنوان"}

                    </div>

                  </div>

                  <Link
                    href={`/dashboard/stores/${store.id}`}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100"
                  >
                    فتح المحل
                    <ArrowLeft size={16} />
                  </Link>

                </div>

              ))

            )}

          </div>

        </div>

      </div>

      {/* ================= MODAL ================= */}

      <AddStoreModal
        open={open}
        onClose={() => {
          setOpen(false);
          loadStores();
        }}
      />

    </div>
  );
}