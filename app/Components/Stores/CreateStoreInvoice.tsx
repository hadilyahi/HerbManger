"use client";

import { useEffect, useMemo, useState } from "react";

interface PurchaseInvoice {
  id: number;
  warehouse_id: number;
  invoice_number: string;
  invoice_date: string;
  total: number;
}

interface InvoiceItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  remaining_quantity: number;
  purchase_price: number;

  sellQuantity?: number;
  sellingPrice?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  storeId: number;
  onSuccess: () => void;
}

export default function CreateStoreInvoice({
  open,
  onClose,
  storeId,
  onSuccess,
}: Props) {
  const [purchaseInvoices, setPurchaseInvoices] = useState<PurchaseInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<number | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [paid, setPaid] = useState(0);
  const [date, setDate] = useState("");

  // إعادة تصفير الحالة عند فتح البوبأب من جديد
  useEffect(() => {
    if (open) {
      setSelectedInvoice(null);
      setItems([]);
      setPaid(0);
      setDate("");
    }
  }, [open]);

  useEffect(() => {
    if (!date) {
      setPurchaseInvoices([]);
      return;
    }

    fetch(`/api/warehouse-purchase-invoices?date=${date}`)
      .then((r) => r.json())
      .then(setPurchaseInvoices);
  }, [date]);

  useEffect(() => {
    if (!selectedInvoice) return;

    fetch(`/api/warehouse-purchase-invoices/${selectedInvoice}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(
          data.map((item: InvoiceItem) => ({
            ...item,
            sellQuantity: 0,
            sellingPrice: item.purchase_price,
          }))
        );
      });
  }, [selectedInvoice]);

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
        warehouseInvoiceId: selectedInvoice,
        warehouseInvoiceItemId: item.id,
        productId: item.product_id,
        quantity: item.sellQuantity,
        purchasePrice: item.purchase_price,
        sellingPrice: item.sellingPrice,
      }));

    if (products.length === 0) {
      alert("اختر منتجاً واحداً على الأقل");
      return;
    }

    const res = await fetch("/api/store-invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        warehouseId: purchaseInvoices.find((i) => i.id === selectedInvoice)?.warehouse_id,
        warehouseInvoiceId: selectedInvoice,
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

    alert("تم إنشاء الفاتورة");
    onSuccess();
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-xl w-[1100px] max-h-[90vh] overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">إنشاء فاتورة بيع</h2>
          <button onClick={onClose} className="text-red-600 text-xl">✕</button>
        </div>

        <div className="mb-6">
          <div className="mb-5">
            <label className="block mb-2 font-medium">تاريخ الفاتورة</label>
            <input
              type="date"
              className="border rounded-lg p-2 w-full"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <label className="block mb-3 font-medium">اختر فاتورة الشراء</label>

          <div className="grid grid-cols-3 gap-3 mb-6">
            {purchaseInvoices.map((invoice) => (
              <div
                key={invoice.id}
                onClick={() => setSelectedInvoice(invoice.id)}
                className={`border rounded-lg p-4 cursor-pointer transition
                ${selectedInvoice === invoice.id ? "border-green-600 bg-green-50" : "hover:border-green-400"}`}
              >
                <div className="font-bold">فاتورة #{invoice.id}</div>
                <div className="text-gray-500 text-sm">{invoice.invoice_date}</div>
                <div className="text-green-700 font-bold mt-2">{invoice.total} دج</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">المنتج</th>
                <th className="p-3">سعر الشراء</th>
                <th className="p-3">المتبقي</th>
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
                  <td
                    className={`p-3 font-bold ${
                      item.remaining_quantity > 20
                        ? "text-green-600"
                        : item.remaining_quantity > 5
                        ? "text-orange-500"
                        : "text-red-600"
                    }`}
                  >
                    {item.remaining_quantity}
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      max={item.remaining_quantity}
                      className="border rounded-lg px-2 py-1 w-28 text-center"
                      value={item.sellQuantity ?? 0}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        const copy = [...items];
                        copy[index].sellQuantity = Math.min(
                          Math.max(value, 0),
                          item.remaining_quantity
                        );
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
            حفظ الفاتورة
          </button>
        </div>
      </div>
    </div>
  );
}