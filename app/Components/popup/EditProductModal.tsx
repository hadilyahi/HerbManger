"use client";

import { useState } from "react";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  categoryId: number;
}

interface Props {
  product: Product;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProductModal({
  product,
  categories,
  onClose,
  onSuccess,
}: Props) {
  const [name, setName] = useState(product.name);
  const [categoryId, setCategoryId] = useState<number>(product.categoryId);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          categoryId,
        }),
      });

      if (!res.ok) throw new Error("فشل التعديل");

      onSuccess();
      onClose();
    } catch (err) {
      alert("حدث خطأ أثناء التعديل");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6">
        <h2 className="text-xl font-bold mb-4 text-center">
          تعديل المنتج
        </h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسم المنتج"
          className="w-full border p-2 rounded mb-3"
        />

        <select
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          className="w-full border p-2 rounded mb-4"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded"
          >
            إلغاء
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "جارٍ الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}
