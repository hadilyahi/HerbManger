"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Wallet,
  Users,
  Phone,
  CalendarDays,
  CreditCard,
  X,
  Save,
  UserPlus,
  AlertCircle,
} from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  phone?: string;
  created_at: string;

  totalInvoices?: number;
  totalPaid?: number;
  remaining?: number;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  // إضافة مورد
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // تعديل مورد
  const [editSupplier, setEditSupplier] =
    useState<Supplier | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // دين / دفعة
  const [debtAmount, setDebtAmount] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [currentSupplier, setCurrentSupplier] =
    useState<Supplier | null>(null);

  // تأكيد الحذف
  const [deleteId, setDeleteId] =
    useState<number | null>(null);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/suppliers");
      const data = await res.json();

      setSuppliers(data);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  /* =========================
     تنسيق المبالغ
  ========================= */

  const formatMoney = (value: number | string | undefined) => {
    return Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  /* =========================
     إضافة مورد
  ========================= */

  const handleSubmit = async () => {
    if (!name.trim()) return;

    await fetch("/api/suppliers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
      }),
    });

    setName("");
    setPhone("");
    setShowForm(false);

    fetchSuppliers();
  };

  /* =========================
     تعديل مورد
  ========================= */

  const openEditModal = (supplier: Supplier) => {
    setEditSupplier(supplier);
    setEditName(supplier.name);
    setEditPhone(supplier.phone || "");
  };

  const handleUpdate = async () => {
    if (!editSupplier || !editName.trim()) return;

    await fetch("/api/suppliers", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: editSupplier.id,
        name: editName,
        phone: editPhone,
      }),
    });

    setEditSupplier(null);

    fetchSuppliers();
  };

  /* =========================
     حذف مورد
  ========================= */

  const handleDelete = async () => {
    if (!deleteId) return;

    await fetch(`/api/suppliers?id=${deleteId}`, {
      method: "DELETE",
    });

    setDeleteId(null);

    fetchSuppliers();
  };

  /* =========================
     إضافة دين
  ========================= */

  const handleAddDebt = async () => {
    if (!currentSupplier || !debtAmount) return;

    await fetch("/api/suppliers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        supplierId: currentSupplier.id,
        debtAmount: Number(debtAmount),
      }),
    });

    setDebtAmount("");
    setCurrentSupplier(null);

    fetchSuppliers();
  };

  /* =========================
     تسجيل دفعة
  ========================= */

  const handleAddPayment = async () => {
    if (!currentSupplier || !paymentAmount) return;

    await fetch("/api/suppliers", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        supplierId: currentSupplier.id,
        paymentAmount: Number(paymentAmount),
      }),
    });

    setPaymentAmount("");
    setCurrentSupplier(null);

    fetchSuppliers();
  };

  /* =========================
     البحث
  ========================= */

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  /* =========================
     الإحصائيات
  ========================= */

  const totalSuppliers = suppliers.length;

  const totalInvoices = suppliers.reduce(
    (sum, supplier) =>
      sum + Number(supplier.totalInvoices || 0),
    0
  );

  const totalPaid = suppliers.reduce(
    (sum, supplier) =>
      sum + Number(supplier.totalPaid || 0),
    0
  );

  const totalDebt = suppliers.reduce(
    (sum, supplier) =>
      sum + Number(supplier.remaining || 0),
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

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Users size={28} />
            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                إدارة الموردين
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                إدارة الموردين والفواتير والمدفوعات والديون
              </p>

            </div>

          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
          >
            <Plus size={19} />
            إضافة مورد جديد
          </button>

        </div>

        {/* =====================================================
            STATISTICS
        ===================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* عدد الموردين */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  عدد الموردين
                </p>

                <h2 className="mt-2 text-3xl font-bold text-blue-600">
                  {totalSuppliers}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  الموردون المسجلون
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={22} />
              </div>

            </div>

          </div>

          {/* عدد الفواتير */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  إجمالي الفواتير
                </p>

                <h2 className="mt-2 text-3xl font-bold text-purple-600">
                  {totalInvoices}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  جميع فواتير الموردين
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <CreditCard size={22} />
              </div>

            </div>

          </div>

          {/* المدفوع */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  إجمالي المدفوع
                </p>

                <h2 className="mt-2 text-2xl font-bold text-emerald-600 sm:text-3xl">
                  {formatMoney(totalPaid)}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  دج
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet size={22} />
              </div>

            </div>

          </div>

          {/* الدين */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">
                  إجمالي الديون
                </p>

                <h2 className="mt-2 text-2xl font-bold text-red-600 sm:text-3xl">
                  {formatMoney(totalDebt)}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  المبلغ المتبقي للموردين
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertCircle size={22} />
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            ADD SUPPLIER
        ===================================================== */}

        {showForm && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <UserPlus size={20} />
              </div>

              <div>

                <h2 className="font-bold text-slate-900">
                  إضافة مورد جديد
                </h2>

                <p className="text-xs text-slate-500">
                  أدخل بيانات المورد
                </p>

              </div>

            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="اسم المورد"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />

              <input
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                placeholder="رقم الهاتف"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />

              <div className="flex gap-3">

                <button
                  onClick={handleSubmit}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  <Save size={17} />
                  حفظ المورد
                </button>

                <button
                  onClick={() => {
                    setShowForm(false);
                    setName("");
                    setPhone("");
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-600 transition hover:bg-slate-200"
                >
                  <X size={18} />
                </button>

              </div>

            </div>

          </div>
        )}

        {/* =====================================================
            TABLE CARD
        ===================================================== */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* عنوان + بحث */}

          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                قائمة الموردين
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {filteredSuppliers.length} مورد ظاهر حالياً
              </p>

            </div>

            <div className="relative w-full sm:w-80">

              <Search
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="ابحث باسم المورد..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-10 pl-4 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />

            </div>

          </div>

          {/* الجدول */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px] text-right">

              <thead className="bg-slate-50">

                <tr className="border-b border-slate-200">

                  <th className="px-5 py-4 text-xs font-bold text-slate-500">
                    المورد
                  </th>

                  <th className="px-5 py-4 text-xs font-bold text-slate-500">
                    الهاتف
                  </th>

                  <th className="px-5 py-4 text-xs font-bold text-slate-500">
                    تاريخ الإضافة
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                    الفواتير
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                    المدفوع
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                    باقي الدين
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold text-slate-500">
                    التحكم
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredSuppliers.length === 0 ? (

                  <tr>

                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <Users size={26} />
                        </div>

                        <p className="text-sm font-semibold text-slate-600">
                          لا توجد نتائج
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          لم يتم العثور على مورد مطابق للبحث
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : (

                  filteredSuppliers.map((supplier) => (

                    <tr
                      key={supplier.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                    >

                      {/* المورد */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 font-bold text-emerald-600">
                            {supplier.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <p className="font-bold text-slate-800">
                              {supplier.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              مورد #{supplier.id}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* الهاتف */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-600">

                          <Phone
                            size={15}
                            className="text-slate-400"
                          />

                          {supplier.phone || "-"}

                        </div>

                      </td>

                      {/* التاريخ */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-600">

                          <CalendarDays
                            size={15}
                            className="text-slate-400"
                          />

                          {new Date(
                            supplier.created_at
                          ).toLocaleDateString("fr-CA")}

                        </div>

                      </td>

                      {/* الفواتير */}

                      <td className="px-5 py-4 text-center">

                        <span className="inline-flex rounded-lg bg-purple-50 px-3 py-1.5 text-sm font-bold text-purple-700">
                          {supplier.totalInvoices ?? 0}
                        </span>

                      </td>

                      {/* المدفوع */}

                      <td className="px-5 py-4 text-center">

                        <span className="font-bold text-emerald-600">
                          {formatMoney(
                            supplier.totalPaid
                          )}{" "}
                          دج
                        </span>

                      </td>

                      {/* الدين */}

                      <td className="px-5 py-4 text-center">

                        <span
                          className={`font-bold ${
                            Number(
                              supplier.remaining || 0
                            ) > 0
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {formatMoney(
                            supplier.remaining
                          )}{" "}
                          دج
                        </span>

                      </td>

                      {/* التحكم */}

                      <td className="px-5 py-4">

                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() =>
                              openEditModal(
                                supplier
                              )
                            }
                            title="تعديل"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() =>
                              setCurrentSupplier(
                                supplier
                              )
                            }
                            title="دين / دفعة"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                          >
                            <Wallet size={16} />
                          </button>

                          <button
                            onClick={() =>
                              setDeleteId(
                                supplier.id
                              )
                            }
                            title="حذف"
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={16} />
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
          DEBT / PAYMENT MODAL
      ===================================================== */}

      {currentSupplier && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Wallet size={21} />
                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    {currentSupplier.name}
                  </h2>

                  <p className="text-xs text-slate-500">
                    إضافة دين أو تسجيل دفعة
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  setCurrentSupplier(null)
                }
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={19} />
              </button>

            </div>

            {/* الدين */}

            <div className="mb-5">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                إضافة دين جديد
              </label>

              <div className="relative">

                <input
                  value={debtAmount}
                  onChange={(e) =>
                    setDebtAmount(e.target.value)
                  }
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-14 text-sm outline-none transition focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
                />

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  دج
                </span>

              </div>

              <button
                onClick={handleAddDebt}
                className="mt-3 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
              >
                إضافة الدين
              </button>

            </div>

            <div className="my-5 border-t border-slate-100" />

            {/* الدفعة */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                تسجيل دفعة جديدة
              </label>

              <div className="relative">

                <input
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(
                      e.target.value
                    )
                  }
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pl-14 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  دج
                </span>

              </div>

              <button
                onClick={handleAddPayment}
                className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                تسجيل الدفعة
              </button>

            </div>

            <button
              onClick={() =>
                setCurrentSupplier(null)
              }
              className="mt-4 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
            >
              إغلاق
            </button>

          </div>

        </div>

      )}

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editSupplier && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  تعديل المورد
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  تعديل بيانات المورد
                </p>

              </div>

              <button
                onClick={() =>
                  setEditSupplier(null)
                }
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>

            </div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              اسم المورد
            </label>

            <input
              value={editName}
              onChange={(e) =>
                setEditName(e.target.value)
              }
              className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="اسم المورد"
            />

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              رقم الهاتف
            </label>

            <input
              value={editPhone}
              onChange={(e) =>
                setEditPhone(e.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              placeholder="رقم الهاتف"
            />

            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setEditSupplier(null)
                }
                className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                إلغاء
              </button>

              <button
                onClick={handleUpdate}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                <Save size={17} />
                حفظ التعديل
              </button>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteId && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">

            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Trash2 size={25} />
            </div>

            <h2 className="text-lg font-bold text-slate-900">
              حذف المورد
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              هل أنت متأكد من حذف هذا المورد؟
              <br />
              لا يمكن التراجع عن هذا الإجراء.
            </p>

            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setDeleteId(null)
                }
                className="flex-1 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
              >
                إلغاء
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
              >
                حذف المورد
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}