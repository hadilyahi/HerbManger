"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

interface Supplier {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
}

interface InvoiceItem {
  productId: number;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateInvoiceModal({
  onClose,
  onSuccess,
}: Props) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [supplierId, setSupplierId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [paidAmount, setPaidAmount] = useState(0);

  const [items, setItems] = useState<InvoiceItem[]>([
    { productId: 0, quantity: 0, purchasePrice: 0, sellingPrice: 0 },
  ]);

  useEffect(() => {
    fetch("http://localhost:3000/api/suppliers")
      .then((res) => res.json())
      .then(setSuppliers);

    fetch("http://localhost:3000/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      { productId: 0, quantity: 0, purchasePrice: 0, sellingPrice: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () =>
    items.reduce(
      (acc, item) => acc + item.quantity * item.purchasePrice,
      0
    );

  const handleSubmit = async () => {
    await fetch("http://localhost:3000/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        supplierId,
        invoiceDate,
        paidAmount,
        items,
      }),
    });

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#f3f6f3] w-[1000px] max-h-[92vh] rounded-[30px] shadow-2xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="p-8 text-center border-b bg-[#f3f6f3]">
          <h2 className="text-3xl font-bold text-gray-800">
            اضافة فاتورة جديدة
          </h2>
        </div>

        {/* BODY */}
        <div className="p-10 overflow-y-auto flex-1">

          {/* Supplier + Date */}
          <div className="grid grid-cols-2 gap-10 mb-12">
            <div>
              <label className="block mb-3 font-semibold text-gray-700">
                اسم المورد
              </label>
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full bg-[#dfe8df] p-4 rounded-2xl outline-none"
              >
                <option value="">اسم المورد</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-3 font-semibold text-gray-700">
                تاريخ الفاتورة
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full bg-[#dfe8df] p-4 rounded-2xl outline-none"
              />
            </div>
          </div>

          {/* ITEMS HEADER */}
          <div className="grid grid-cols-5 gap-6 mb-4 text-center font-semibold text-gray-700">
            <div>المنتج</div>
            <div>سعر الشراء</div>
            <div>الكمية</div>
            <div>سعر البيع</div>
            <div>السعر الاجمالي</div>
          </div>

          {/* ITEMS */}
          {items.map((item, index) => {
            const rowTotal = item.quantity * item.purchasePrice;

            return (
              <div
                key={index}
                className="grid grid-cols-5 gap-6 mb-6 items-center"
              >
                <select
                  className="bg-[#dfe8df] p-3 rounded-2xl"
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].productId = Number(e.target.value);
                    setItems(newItems);
                  }}
                >
                  <option value="">اختر المنتج ...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="00.00"
                  className="bg-[#dfe8df] p-3 rounded-2xl text-center"
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].purchasePrice = Number(e.target.value);
                    setItems(newItems);
                  }}
                />

                <input
                  type="number"
                  placeholder="00"
                  className="bg-[#dfe8df] p-3 rounded-2xl text-center"
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].quantity = Number(e.target.value);
                    setItems(newItems);
                  }}
                />

                <input
                  type="number"
                  placeholder="00.00"
                  className="bg-[#dfe8df] p-3 rounded-2xl text-center"
                  onChange={(e) => {
                    const newItems = [...items];
                    newItems[index].sellingPrice = Number(e.target.value);
                    setItems(newItems);
                  }}
                />

                <div className="flex items-center justify-between bg-[#dfe8df] p-3 rounded-2xl">
                  <span>{rowTotal.toFixed(2)} دج</span>
                  {items.length > 1 && (
                    <Trash2
                      size={18}
                      className="text-red-500 cursor-pointer"
                      onClick={() => removeItem(index)}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* ADD ITEM */}
          <div className="flex justify-end mb-12">
            <button
              onClick={addItem}
              className="flex items-center gap-2 text-gray-500 font-semibold"
            >
              <Plus size={18} />
              إضافة منتج آخر
            </button>
          </div>

          {/* TOTALS */}
          <div className="grid grid-cols-2 gap-10 mb-10">
            <div>
              <label className="block mb-3 font-semibold">
                المبلغ المدفوع
              </label>
              <input
                type="number"
                className="w-full bg-[#dfe8df] p-4 rounded-2xl text-center"
                onChange={(e) =>
                  setPaidAmount(Number(e.target.value))
                }
              />
            </div>

            <div>
              <label className="block mb-3 font-semibold">
                السعر الإجمالي للفاتورة كاملة
              </label>
              <div className="bg-[#dfe8df] p-4 rounded-2xl text-center">
                {calculateTotal().toFixed(2)} دج
              </div>
            </div>
          </div>

          <div className="text-center">
            <label className="block mb-3 font-semibold">
              المبلغ المتبقي
            </label>
            <div className="bg-[#dfe8df] p-4 rounded-2xl w-[300px] mx-auto text-center">
              {(calculateTotal() - paidAmount).toFixed(2)} دج
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-8 flex justify-center gap-16 bg-[#f3f6f3]">
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-14 py-3 rounded-2xl text-lg font-semibold shadow"
          >
            إلغاء
          </button>

          <button
            onClick={handleSubmit}
            className="bg-blue-700 text-white px-14 py-3 rounded-2xl text-lg font-semibold shadow"
          >
            تأكيد
          </button>
        </div>
      </div>
    </div>
  );
}
