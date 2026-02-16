"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { InvoiceItem } from "@/types/invoice";

interface EditInvoiceModalProps {
  invoiceId: number;
  onClose: () => void;
  onSuccess: () => void;
}

// واجهة تمثل العنصر داخل الفاتورة عند التعديل
interface EditItem {
  id?: number; // موجود إذا كان العنصر موجود مسبقًا
  productId?: number; // مطلوب فقط للعناصر الجديدة
  productName?: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

// نوع البيانات القادمة من API
interface InvoiceAPI {
  supplierId: number;
  paidAmount: number;
  items: EditItem[];
}

export default function EditInvoiceModal({ invoiceId, onClose, onSuccess }: EditInvoiceModalProps) {
  const [supplierId, setSupplierId] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [items, setItems] = useState<EditItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // جلب بيانات الفاتورة عند فتح البوباب
 useEffect(() => {
  const fetchInvoice = async () => {
    if (!invoiceId) return;
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`);
      const data = await res.json();

      setSupplierId(data.supplierId ?? 0);
      setPaidAmount(data.paidAmount ?? 0);
      setItems((data.items || []).map((i: InvoiceItem) => ({
  id: i.id,
  productId: i.productId,
  productName: i.productName || "",
  quantity: i.quantity ?? 0,
  purchasePrice: i.purchasePrice ?? 0,
  sellingPrice: i.sellingPrice ?? 0,
})));
    } catch (err) {
      console.error(err);
    }
  };

  fetchInvoice();
}, [invoiceId]);

  // تحديث عنصر
  const updateItem = (index: number, field: keyof EditItem, value: string | number) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // إضافة عنصر جديد
  const addItem = () => {
    setItems((prev) => [...prev, { quantity: 1, purchasePrice: 0, sellingPrice: 0 }]);
  };

  // حذف عنصر
  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // حفظ التعديلات
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          paidAmount,
          items,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        alert(result.error || "حدث خطأ أثناء حفظ التعديلات");
      }
    } catch (err) {
      console.error(err);
      alert("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[800px] p-6 rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-4">تعديل الفاتورة #{invoiceId}</h2>

        {/* بيانات أساسية */}
        <div className="mb-4 flex gap-4 items-center">
          <div>
            <label className="block font-semibold mb-1">المورد</label>
            <input
              type="number"
              value={supplierId}
              onChange={(e) => setSupplierId(Number(e.target.value))}
              className="border rounded px-2 py-1 w-40"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">المبلغ المدفوع</label>
            <input
              type="number"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              className="border rounded px-2 py-1 w-40"
            />
          </div>
        </div>

        {/* جدول المنتجات */}
        <div className="mb-4">
          <h3 className="font-semibold mb-2">المنتجات</h3>
          <table className="w-full border border-gray-300 text-center">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">اسم المنتج</th>
                <th className="p-2 border">الكمية</th>
                <th className="p-2 border">سعر الشراء</th>
                <th className="p-2 border">سعر البيع</th>
                <th className="p-2 border">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td className="p-2 border">
                    <input
                      type="text"
                      value={item.productName || ""}
                      onChange={(e) => updateItem(index, "productName", e.target.value)}
                      className="border rounded px-1 py-0.5 w-full"
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                      className="border rounded px-1 py-0.5 w-20"
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="number"
                      value={item.purchasePrice}
                      onChange={(e) => updateItem(index, "purchasePrice", Number(e.target.value))}
                      className="border rounded px-1 py-0.5 w-24"
                    />
                  </td>
                  <td className="p-2 border">
                    <input
                      type="number"
                      value={item.sellingPrice}
                      onChange={(e) => updateItem(index, "sellingPrice", Number(e.target.value))}
                      className="border rounded px-1 py-0.5 w-24"
                    />
                  </td>
                  <td className="p-2 border">
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            className="flex items-center gap-2 mt-2 px-4 py-2 bg-green-300 rounded hover:bg-green-400"
            onClick={addItem}
          >
            <Plus size={16} /> إضافة منتج
          </button>
        </div>

        {/* أزرار الحفظ والإلغاء */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            إلغاء
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "جارٍ الحفظ..." : "حفظ التعديلات"}
          </button>
        </div>
      </div>
    </div>
  );
}
