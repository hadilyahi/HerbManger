"use client";

import { useEffect, useState } from "react";
import AddWarehouseModal from "@/app/Components/Warehouses/AddWarehouseModal";
import DeleteWarehouseModal from "@/app/Components/Warehouses/DeleteWarehouseModal";
import Link from "next/link";
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

  return (
    <div className="p-6">

      <div className="flex items-center justify-between mb-6">

        <h1 className="text-2xl font-bold">
          المخازن
        </h1>

        <button
          onClick={() => {
            setSelectedWarehouse(null);
            setOpenModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        >
          + إضافة مخزن
        </button>

      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>
              <th className="p-3">#</th>
              <th className="p-3">اسم المخزن</th>
              <th className="p-3">الهاتف</th>
              <th className="p-3">الرصيد السابق</th>
              <th className="p-3">العمليات</th>
            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td colSpan={5} className="text-center p-6">
                  جاري التحميل...
                </td>
              </tr>

            ) : warehouses.length === 0 ? (

              <tr>
                <td colSpan={5} className="text-center p-6">
                  لا توجد مخازن
                </td>
              </tr>

            ) : (

              warehouses.map((warehouse) => (

                <tr
                  key={warehouse.id}
                  className="border-t hover:bg-gray-50"
                >

                  <td className="p-3">
                    {warehouse.id}
                  </td>

                  <td className="p-3">
  <Link
    href={`/dashboard/warehouses/${warehouse.id}`}
    className="text-blue-600 hover:underline"
  >
    {warehouse.name}
  </Link>
</td>

                  <td className="p-3">
                    {warehouse.phone || "-"}
                  </td>

                  <td className="p-3">
                    {warehouse.previous_balance}
                  </td>

                  <td className="p-3">

                    <div className="flex gap-4">

                      <button
                        onClick={() => {
                          setSelectedWarehouse(warehouse);
                          setOpenModal(true);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        تعديل
                      </button>

                      <button
                        onClick={() => {
                          setSelectedWarehouse(warehouse);
                          setDeleteOpen(true);
                        }}
                        className="text-red-600 hover:underline"
                      >
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