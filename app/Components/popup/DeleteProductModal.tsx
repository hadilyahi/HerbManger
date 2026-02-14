// Components/popup/DeleteProductModal.tsx
"use client";



interface DeleteProductModalProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}
// types.ts
export interface Product {
  id: number;
  name: string;
  categoryId: number | null;
}

export interface Category {
  id: number;
  name: string;
}


export default function DeleteProductModal({
  product,
  onClose,
  onSuccess,
}: DeleteProductModalProps) {
  const handleDelete = async () => {
    if (!product?.id || isNaN(Number(product.id))) {
      alert("الـ ID غير صالح");
      return;
    }

    try {
      const response = await fetch(`/api/products/${Number(product.id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message || "فشل في الحذف");
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Delete error:", error.message);
        alert("خطأ: " + error.message);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white text-black p-6 rounded w-96">
        <h2 className="text-lg font-bold mb-4">حذف المنتج</h2>
        <p className="mb-4">
          هل أنت متأكد أنك تريد حذف المنتج <strong>{product.name}</strong>؟
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">
            الغاء
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 px-4 py-2 rounded text-white"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
