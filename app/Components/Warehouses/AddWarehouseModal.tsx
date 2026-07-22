"use client";

import { useEffect, useState } from "react";

interface Warehouse {
  id: number;
  name: string;
  phone: string;
  address: string;
  previous_balance: number;
  notes?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  warehouse?: Warehouse | null;
}

export default function AddWarehouseModal({
  open,
  onClose,
  onSuccess,
  warehouse,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [previousBalance, setPreviousBalance] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (warehouse) {
      setName(warehouse.name);
      setPhone(warehouse.phone);
      setAddress(warehouse.address);
      setPreviousBalance(warehouse.previous_balance);
      setNotes(warehouse.notes || "");
    } else {
      setName("");
      setPhone("");
      setAddress("");
      setPreviousBalance(0);
      setNotes("");
    }
  }, [warehouse, open]);

  async function saveWarehouse() {
    if (!name.trim()) {
      alert("أدخل اسم المخزن");
      return;
    }

    const url = warehouse
      ? `/api/warehouses?id=${warehouse.id}`
      : "/api/warehouses";

    const method = warehouse ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        phone,
        address,
        previous_balance: previousBalance,
        notes,
      }),
    });

    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      alert("فشل الحفظ");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[500px] p-6">

        <h2 className="text-xl font-bold mb-5">
          {warehouse ? "تعديل مخزن" : "إضافة مخزن"}
        </h2>

        <div className="space-y-4">

          <input
            className="w-full border rounded-lg p-2"
            placeholder="اسم المخزن"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full border rounded-lg p-2"
            placeholder="الهاتف"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="w-full border rounded-lg p-2"
            placeholder="العنوان"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <input
            type="number"
            className="w-full border rounded-lg p-2"
            placeholder="الرصيد السابق"
            value={previousBalance}
            onChange={(e) => setPreviousBalance(Number(e.target.value))}
          />

          <textarea
            className="w-full border rounded-lg p-2"
            placeholder="ملاحظات"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            إلغاء
          </button>

          <button
            onClick={saveWarehouse}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            {warehouse ? "تحديث" : "حفظ"}
          </button>

        </div>

      </div>

    </div>
  );
}