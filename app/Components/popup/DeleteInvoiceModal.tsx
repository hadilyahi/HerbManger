"use client";
import { useState } from "react";

interface Props {
  invoiceId: number;
  onClose: () => void;
  onSuccess: (deletedId: number) => void;
}

export default function DeleteInvoiceModal({ invoiceId, onClose, onSuccess }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert("حدث خطأ: " + (data.message || "فشل الحذف"));
        setIsDeleting(false);
        return;
      }

      // تحديث الجدول وإغلاق المودال
      onSuccess(invoiceId);
      onClose();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الحذف.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-10 rounded-3xl text-center">
        <h2 className="text-xl font-bold mb-6">هل أنت متأكد من حذف الفاتورة؟</h2>

        <div className="flex gap-6 justify-center">
          <button onClick={onClose} disabled={isDeleting} className="bg-gray-300 px-8 py-3 rounded-xl">
            إلغاء
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-8 py-3 rounded-xl text-white ${isDeleting ? "bg-red-400" : "bg-red-600"}`}
          >
            {isDeleting ? "جارٍ الحذف..." : "حذف"}
          </button>
        </div>
      </div>
    </div>
  );
}
