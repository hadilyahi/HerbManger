"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddCategoryModal({ onClose, onSuccess }: Props) {
  const [name, setName] = useState("");

  const handleAdd = async () => {
    await fetch("http://localhost:3000/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white text-black p-6 rounded w-96">
        <h2 className="text-lg font-bold mb-4">اضافة فئة</h2>

        <input
          className="w-full border p-2 mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم الفئة"
        />

        <div className="flex justify-end gap-3">
          <button onClick={onClose}>الغاء</button>
          <button
            onClick={handleAdd}
            className="bg-green-400 px-4 py-2 rounded"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
