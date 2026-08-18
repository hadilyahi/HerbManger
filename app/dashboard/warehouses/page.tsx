
"use client";

import { useEffect, useState } from "react";
import AddWarehouseModal from "@/app/Components/Warehouses/AddWarehouseModal";
import DeleteWarehouseModal from "@/app/Components/Warehouses/DeleteWarehouseModal";
import Link from "next/link";
import {
  Warehouse as WarehouseIcon,
  Plus,
  Pencil,
  Trash2,
  Phone,
  Wallet,
  MapPin,
  PackageOpen,
  ArrowLeft,
} from "lucide-react";

interface Warehouse {
  id: number;
  name: string;
  phone: string;
  address: string;
  previous_balance: number;
  notes?: string;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selectedWarehouse, setSelectedWarehouse] =
    useState<Warehouse | null>(null);

  async function loadWarehouses() {
    try {
      setLoading(true);

      const res = await fetch("/api/warehouses");
      const data = await res.json();

      setWarehouses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWarehouses();
  }, []);

  const totalBalance = warehouses.reduce(
    (sum, warehouse) => sum + Number(warehouse.previous_balance || 0),
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

          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <WarehouseIcon size={25} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                  المخازن
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  إدارة المخازن ومتابعة أرصدتها وبياناتها
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedWarehouse(null);
              setOpenModal(true);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
          >
            <Plus size={19} />
            إضافة مخزن
          </button>

        </div>

        {/* ================= STAT CARDS ================= */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* عدد المخازن */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  إجمالي المخازن
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {warehouses.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <WarehouseIcon size={24} />
              </div>

            </div>
          </div>

          {/* الرصيد السابق */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  إجمالي الأرصدة السابقة
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {totalBalance.toLocaleString("ar-DZ")}{" "}
                  <span className="text-sm font-medium text-slate-500">
                    دج
                  </span>
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Wallet size={23} />
              </div>

            </div>
          </div>

          {/* الحالة */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  حالة النظام
                </p>

                <p className="mt-2 flex items-center gap-2 text-lg font-bold text-slate-900">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  النظام يعمل
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <PackageOpen size={23} />
              </div>

            </div>
          </div>

        </div>

        {/* ================= TABLE ================= */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Table Header */}
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  قائمة المخازن
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  جميع المخازن المسجلة في النظام
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {warehouses.length} مخزن
              </div>

            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">

            <table className="w-full text-right">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-6 py-4 text-xs font-bold text-slate-500">
                    #
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-slate-500">
                    اسم المخزن
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-slate-500">
                    الهاتف
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-slate-500">
                    العنوان
                  </th>

                  <th className="px-6 py-4 text-xs font-bold text-slate-500">
                    الرصيد السابق
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                    العمليات
                  </th>

                </tr>
              </thead>

              <tbody>

                {loading ? (

                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center">

                      <div className="flex flex-col items-center justify-center">

                        <div className="mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

                        <p className="text-sm font-medium text-slate-500">
                          جاري تحميل المخازن...
                        </p>

                      </div>

                    </td>
                  </tr>

                ) : warehouses.length === 0 ? (

                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">

                      <div className="flex flex-col items-center">

                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                          <WarehouseIcon size={30} />
                        </div>

                        <h3 className="text-base font-bold text-slate-800">
                          لا توجد مخازن
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          قم بإضافة أول مخزن للبدء
                        </p>

                        <button
                          onClick={() => {
                            setSelectedWarehouse(null);
                            setOpenModal(true);
                          }}
                          className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                          <Plus size={17} />
                          إضافة مخزن
                        </button>

                      </div>

                    </td>
                  </tr>

                ) : (

                  warehouses.map((warehouse) => (

                    <tr
                      key={warehouse.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                    >

                      {/* ID */}
                      <td className="px-6 py-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                          {warehouse.id}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-6 py-4">

                        <Link
                          href={`/dashboard/warehouses/${warehouse.id}`}
                          className="group flex items-center gap-3"
                        >

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                            <WarehouseIcon size={19} />
                          </div>

                          <div>
                            <p className="font-bold text-slate-800 transition group-hover:text-emerald-600">
                              {warehouse.name}
                            </p>

                            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                              عرض تفاصيل المخزن
                              <ArrowLeft size={12} />
                            </p>
                          </div>

                        </Link>

                      </td>

                      {/* Phone */}
                      <td className="px-6 py-4">

                        <div className="flex items-center gap-2 text-sm text-slate-600">

                          <Phone size={16} className="text-slate-400" />

                          {warehouse.phone || "-"}

                        </div>

                      </td>

                      {/* Address */}
                      <td className="px-6 py-4">

                        <div className="flex max-w-[180px] items-center gap-2 text-sm text-slate-600">

                          <MapPin
                            size={16}
                            className="shrink-0 text-slate-400"
                          />

                          <span className="truncate">
                            {warehouse.address || "-"}
                          </span>

                        </div>

                      </td>

                      {/* Balance */}
                      <td className="px-6 py-4">

                        <div className="inline-flex items-center rounded-lg bg-amber-50 px-3 py-1.5">

                          <span className="font-bold text-amber-700">
                            {Number(
                              warehouse.previous_balance || 0
                            ).toLocaleString("ar-DZ")}
                          </span>

                          <span className="mr-1 text-xs text-amber-600">
                            دج
                          </span>

                        </div>

                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">

                        <div className="flex items-center justify-center gap-2">

                          <button
                            onClick={() => {
                              setSelectedWarehouse(warehouse);
                              setOpenModal(true);
                            }}
                            className="flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                          >
                            <Pencil size={15} />
                            تعديل
                          </button>

                          <button
                            onClick={() => {
                              setSelectedWarehouse(warehouse);
                              setDeleteOpen(true);
                            }}
                            className="flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                          >
                            <Trash2 size={15} />
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

          {/* ================= MOBILE CARDS ================= */}
          <div className="divide-y divide-slate-100 md:hidden">

            {loading ? (

              <div className="flex flex-col items-center justify-center px-5 py-14">

                <div className="mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />

                <p className="text-sm text-slate-500">
                  جاري تحميل المخازن...
                </p>

              </div>

            ) : warehouses.length === 0 ? (

              <div className="px-5 py-14 text-center">

                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <WarehouseIcon size={27} />
                </div>

                <p className="font-bold text-slate-800">
                  لا توجد مخازن
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  قم بإضافة أول مخزن للبدء
                </p>

              </div>

            ) : (

              warehouses.map((warehouse) => (

                <div
                  key={warehouse.id}
                  className="p-5 transition hover:bg-slate-50"
                >

                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">

                    <Link
                      href={`/dashboard/warehouses/${warehouse.id}`}
                      className="flex min-w-0 items-center gap-3"
                    >

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <WarehouseIcon size={21} />
                      </div>

                      <div className="min-w-0">

                        <h3 className="truncate font-bold text-slate-800">
                          {warehouse.name}
                        </h3>

                        <p className="mt-0.5 text-xs text-slate-400">
                          مخزن #{warehouse.id}
                        </p>

                      </div>

                    </Link>

                    <div className="shrink-0 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                      {Number(
                        warehouse.previous_balance || 0
                      ).toLocaleString("ar-DZ")}{" "}
                      دج
                    </div>

                  </div>

                  {/* Info */}
                  <div className="mt-4 grid grid-cols-1 gap-2 rounded-xl bg-slate-50 p-3">

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={15} className="text-slate-400" />
                      {warehouse.phone || "لا يوجد هاتف"}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={15} className="text-slate-400" />
                      {warehouse.address || "لا يوجد عنوان"}
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="mt-4 grid grid-cols-2 gap-2">

                    <button
                      onClick={() => {
                        setSelectedWarehouse(warehouse);
                        setOpenModal(true);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                    >
                      <Pencil size={16} />
                      تعديل
                    </button>

                    <button
                      onClick={() => {
                        setSelectedWarehouse(warehouse);
                        setDeleteOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <Trash2 size={16} />
                      حذف
                    </button>

                  </div>

                </div>

              ))

            )}

          </div>

        </div>

      </div>

      {/* ================= MODALS ================= */}

      <AddWarehouseModal
        open={openModal}
        warehouse={selectedWarehouse}
        onClose={() => {
          setOpenModal(false);
          setSelectedWarehouse(null);
        }}
        onSuccess={loadWarehouses}
      />

      <DeleteWarehouseModal
        open={deleteOpen}
        warehouseId={selectedWarehouse?.id ?? null}
        warehouseName={selectedWarehouse?.name ?? ""}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedWarehouse(null);
        }}
        onSuccess={loadWarehouses}
      />

    </div>
  );
}

