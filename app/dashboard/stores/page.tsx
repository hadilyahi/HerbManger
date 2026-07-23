"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AddStoreModal from "@/app/Components/Stores/AddStoreModal";


interface Store {
  id: number;
  name: string;
  phone: string;
  address: string;
  previous_balance: number;
  current_balance: number;
  notes: string;
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [open, setOpen] = useState(false);

  async function loadStores() {
    const res = await fetch("/api/stores");
    const data = await res.json();
    setStores(data);
  }

  useEffect(() => {
    loadStores();
  }, []);

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">

        <h1 className="text-3xl font-bold">
          المحلات
        </h1>

        <button
          onClick={() => setOpen(true)}
          className="bg-green-600 text-white px-5 py-2 rounded-lg"
        >
          + إضافة محل
        </button>

      </div>

      <div className="overflow-auto bg-white rounded-xl shadow">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3">الاسم</th>

              <th className="p-3">الهاتف</th>

              <th className="p-3">الرصيد</th>

              <th className="p-3">العملية</th>

            </tr>

          </thead>

          <tbody>

            {stores.map((store) => (

              <tr
                key={store.id}
                className="border-b"
              >

                <td className="p-3">{store.name}</td>

                <td className="p-3">{store.phone}</td>

                <td className="p-3">
                  {store.current_balance} دج
                </td>

                <td className="p-3">

                  <Link
                    href={`/dashboard/stores/${store.id}`}
                    className="text-blue-600"
                  >
                    فتح
                  </Link>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

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