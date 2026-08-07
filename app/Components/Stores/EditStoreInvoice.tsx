"use client";

import { useEffect, useMemo, useState } from "react";

interface InvoiceItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  remaining_quantity: number;
  purchase_price: number;

  warehouse_invoice_id: number;
  warehouse_invoice_item_id: number;

  sellQuantity?: number;
  sellingPrice?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  storeId: number;
  invoiceId: number;
  onSuccess: () => void;
}

export default function EditStoreInvoice({
  open,
  onClose,
  storeId,
  invoiceId,
  onSuccess,
}: Props) {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [paid, setPaid] = useState(0);
  const [warehouseId, setWarehouseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !invoiceId) return;

    async function loadInvoice() {
      setLoading(true);
      try {
        const res = await fetch(`/api/store-invoices/${invoiceId}`);
        const data = await res.json();

        setPaid(Number(data.paid));
        setWarehouseId(data.warehouse_id); 
        setItems(
          data.items.map((item: any) => ({
            id: item.id,
            product_id: item.product_id,
            product_name: item.name,
            quantity: item.quantity,
            remaining_quantity: item.quantity,
            purchase_price: item.purchase_price,

            warehouse_invoice_id: item.warehouse_invoice_id,
            warehouse_invoice_item_id: item.warehouse_invoice_item_id,

            sellQuantity: item.quantity,
            sellingPrice: item.selling_price,
          }))
        );
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [open, invoiceId]);

  const total = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + (item.sellQuantity || 0) * (item.sellingPrice || 0),
      0
    );
  }, [items]);

  const remaining = total - paid;

  async function saveInvoice() {
    const products = items
      .filter((item) => (item.sellQuantity || 0) > 0)
      .map((item) => ({
        warehouseInvoiceId: item.warehouse_invoice_id,
        warehouseInvoiceItemId: item.warehouse_invoice_item_id,
        productId: item.product_id,
        quantity: item.sellQuantity,
        purchasePrice: item.purchase_price,
        sellingPrice: item.sellingPrice,
      }));

    if (products.length === 0) {
      alert("اختر منتجاً واحداً على الأقل");
      return;
    }

    const res = await fetch(`/api/store-invoices/${invoiceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        warehouseId, 
        
        warehouseInvoiceId: items[0]?.warehouse_invoice_id,
        total,
        paid,
        remaining,
        items: products,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      return;
    }

    alert("تم تعديل الفاتورة");
    onSuccess();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-xl w-[1100px] max-h-[90vh] overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">تعديل فاتورة البيع</h2>
          <button onClick={onClose} className="text-red-600 text-xl">✕</button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">جاري تحميل الفاتورة...</div>
        ) : (
          <>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3">المنتج</th>
                    <th className="p-3">سعر الشراء</th>
                    <th className="p-3">الكمية</th>
                    <th className="p-3">سعر البيع</th>
                    <th className="p-3">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-3">{item.product_name}</td>
                      <td className="p-3 text-blue-600 font-bold">{item.purchase_price} دج</td>
                      <td className="p-3">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          className="border rounded-lg px-2 py-1 w-28 text-center"
                          value={item.sellQuantity ?? 0}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            const copy = [...items];
                            copy[index].sellQuantity = Math.max(value, 0);
                            setItems(copy);
                          }}
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="number"
                          className="border rounded-lg px-2 py-1 w-28 text-center"
                          value={item.sellingPrice ?? item.purchase_price}
                          onChange={(e) => {
                            const copy = [...items];
                            copy[index].sellingPrice = Number(e.target.value);
                            setItems(copy);
                          }}
                        />
                      </td>
                      <td className="p-3">
                        {(item.sellQuantity || 0) * (item.sellingPrice || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block mb-2">المدفوع</label>
                <input
                  type="number"
                  className="border rounded-lg p-2 w-full"
                  value={paid}
                  onChange={(e) => setPaid(Number(e.target.value))}
                />
              </div>
              <div className="flex items-end">
                <h3 className="text-xl font-bold">الإجمالي : {total} دج</h3>
              </div>
              <div className="flex items-end">
                <h3 className="text-xl font-bold text-red-600">المتبقي : {remaining} دج</h3>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={onClose} className="bg-gray-300 px-5 py-2 rounded-lg">إلغاء</button>
              <button onClick={saveInvoice} className="bg-green-600 text-white px-6 py-2 rounded-lg">
                حفظ التعديلات
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}