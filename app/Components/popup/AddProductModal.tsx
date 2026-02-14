"use client";
import { useState } from "react";

type Category = {
  id: string | number;
  name: string;
};

interface AddProductModalProps {
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddProductModal({ categories, onClose, onSuccess }: AddProductModalProps) {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");


  const handleAdd = async () => {
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, categoryId }),
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white text-black p-6 rounded w-96">
        <h2 className="text-lg font-bold mb-4">اضافة منتج</h2>

        <input
          className="w-full border p-2 mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم المنتج"
        />
        <select
            className="w-full border p-2 mb-4"
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
            >
            <option value="">اختر فئة</option>
            {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                {cat.name}
                </option>
            ))}
        </select>


        <div className="flex justify-end gap-3">
          <button onClick={onClose}>الغاء</button>
          <button onClick={handleAdd} className="bg-green-400 px-4 py-2 rounded">
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
