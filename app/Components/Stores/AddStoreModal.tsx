"use client";

import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddStoreModal({
  open,
  onClose,
}: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [previousBalance, setPreviousBalance] = useState(0);
  const [notes, setNotes] = useState("");

  if (!open) return null;

  async function save() {
    const res = await fetch("/api/stores", {
      method: "POST",
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

    if (!res.ok) {
      alert("حدث خطأ");
      return;
    }

    onClose();

    setName("");
    setPhone("");
    setAddress("");
    setPreviousBalance(0);
    setNotes("");
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">

      <div className="bg-white rounded-xl w-[500px] p-6">

        <h2 className="text-2xl font-bold mb-4">
          إضافة محل
        </h2>

        <input
          className="border w-full p-2 rounded mb-3"
          placeholder="اسم المحل"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border w-full p-2 rounded mb-3"
          placeholder="الهاتف"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="border w-full p-2 rounded mb-3"
          placeholder="العنوان"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <input
          type="number"
          className="border w-full p-2 rounded mb-3"
          placeholder="الدين السابق"
          value={previousBalance}
          onChange={(e) =>
            setPreviousBalance(Number(e.target.value))
          }
        />

        <textarea
          className="border w-full p-2 rounded mb-4"
          placeholder="ملاحظات"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-end gap-2">

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            إلغاء
          </button>

          <button
            onClick={save}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            حفظ
          </button>

        </div>

      </div>

    </div>
  );
}