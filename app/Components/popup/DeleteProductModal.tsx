"use client";

interface Product {
  id: number;
  name: string;
}

interface Props {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteProductModal({
  product,
  onClose,
  onSuccess,
}: Props) {
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("فشل حذف المنتج");
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء حذف المنتج");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-96 p-6 text-center">
        <h2 className="text-xl font-bold mb-4 text-red-600">
          تأكيد الحذف
        </h2>

        <p className="mb-6 text-gray-700">
          هل أنت متأكد من حذف المنتج:
          <br />
          <span className="font-semibold text-gray-900">
            {product.name}
          </span>
          ؟
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            إلغاء
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            حذف
          </button>
        </div>
      </div>
    </div>
  );
}
