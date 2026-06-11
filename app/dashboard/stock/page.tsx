"use client";

import { useEffect, useState } from "react";
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StockItem {
  product_id: number;
  product_name: string;
  quantity: number;
}

interface Product {
  id: number;
  name: string;
}

export default function StockPage() {
  const [open, setOpen] = useState(false);

  const [stock, setStock] = useState<StockItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [items, setItems] = useState<
    { productId: string; quantity: number }[]
  >([]);
  const [editOpen, setEditOpen] = useState(false);

const [selectedItem, setSelectedItem] =
  useState<StockItem | null>(null);

const [editQuantity, setEditQuantity] = useState(0);
const [deleteOpen, setDeleteOpen] = useState(false);
const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  // =====================
  // FETCH DATA
  // =====================
  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    fetchStock();
    // eslint-disable-next-line react-hooks/immutability
    fetchProducts();
  }, []);

  async function fetchStock() {
    const res = await fetch("/api/stock");
    const data = await res.json();
    setStock(data);
  }

  async function fetchProducts() {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }

  // =====================
  // ADD ROW
  // =====================
  function addRow() {
    setItems([...items, { productId: "", quantity: 0 }]);
  }

  // =====================
  // REMOVE ROW
  // =====================
  function removeRow(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  // =====================
  // UPDATE ROW
  // =====================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function updateRow(index: number, field: string, value: any) {
    const newItems = [...items];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  }

  // =====================
  // SUBMIT
  // =====================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    setOpen(false);
    setItems([]);
    fetchStock();
  }
    function openEdit(item: StockItem) {
  setSelectedItem(item);
  setEditQuantity(item.quantity);
  setEditOpen(true);
}

async function handleUpdateStock() {
  if (!selectedItem) return;

  await fetch(`/api/stock/${selectedItem.product_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quantity: editQuantity,
    }),
  });

  setEditOpen(false);
  fetchStock();
  
}

function openDeleteDialog(productId: number) {
  setSelectedDeleteId(productId);
  setDeleteOpen(true);
}

async function handleDeleteStock() {
  if (!selectedDeleteId) return;

  await fetch(`/api/stock/${selectedDeleteId}`, {
    method: "DELETE",
  });

  setDeleteOpen(false);
  setSelectedDeleteId(null);

  fetchStock();
}

  // =====================
  // STATS
  // =====================
  const totalProducts = stock.length;
  const outOfStock = stock.filter((s) => s.quantity === 0).length;

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold flex justify-center">إدارة المخزون</h1>
        <p className="text-gray-500 mt-2 flex justify-center">
          إدارة المنتجات الموجودة في المستودع المركزي
        </p>
      </div>

      {/* STATS */}
      <div className="grid gap-5 md:grid-cols-2">

        <div className="bg-white rounded-3xl shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">إجمالي المنتجات</span>
            <Package className="text-green-600" />
          </div>
          <h2 className="text-4xl font-bold mt-4">{totalProducts}</h2>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">منتجات نافدة</span>
            <AlertTriangle className="text-red-500" />
          </div>
          <h2 className="text-4xl font-bold mt-4">{outOfStock}</h2>
        </div>

      </div>

      {/* TOOLBAR */}
      <div className="bg-white rounded-3xl border shadow-sm p-4 flex flex-col md:flex-row gap-4 justify-between">

        <div className="relative w-full md:w-96">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <Input placeholder="البحث عن منتج..." className="pl-10" />
        </div>

        {/* ADD BUTTON */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl flex items-center gap-2">
              <Plus size={18} />
              إضافة مخزون
            </button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[600px] rounded-3xl">

            <DialogHeader>
              <DialogTitle className="text-right text-2xl">
                إضافة مخزون متعدد
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">

              {/* ADD ROW BUTTON */}
              <div className="flex justify-between items-center">
                <Label>المنتجات</Label>

                <button
                  type="button"
                  onClick={addRow}
                  className="text-green-600 text-sm"
                >
                  + إضافة منتج
                </button>
              </div>

              {/* ROWS */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">

                {items.map((item, index) => (
                  <div key={index} className="flex gap-3">

                    {/* PRODUCT */}
                    <Select
                      value={item.productId}
                      onValueChange={(value) =>
                        updateRow(index, "productId", value)
                      }
                    >
                      <SelectTrigger className="w-1/2">
                        <SelectValue placeholder="منتج" />
                      </SelectTrigger>

                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem
                            key={p.id}
                            value={p.id.toString()}
                          >
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* QUANTITY */}
                    <Input
                      type="number"
                      placeholder="الكمية"
                      className="w-1/2"
                      value={item.quantity}
                      onChange={(e) =>
                        updateRow(index, "quantity", Number(e.target.value))
                      }
                    />

                    {/* REMOVE */}
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="text-red-500"
                    >
                      ✕
                    </button>

                  </div>
                ))}

              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 pt-3">

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="border px-4 py-2 rounded-xl"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl"
                >
                  حفظ
                </button>

              </div>

            </form>

          </DialogContent>
        </Dialog>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">

        <table className="w-full">

          <thead className="bg-green-50">
  <tr>
    <th className="text-right p-4">المنتج</th>
    <th className="text-right p-4">الكمية</th>
    <th className="text-right p-4">الحالة</th>
    <th className="text-right p-4">العمليات</th>
  </tr>
</thead>

         <tbody>
  {stock.map((item) => (
    <tr
      key={item.product_id}
      className="border-t hover:bg-gray-50"
    >
      <td className="p-4 font-medium">
        {item.product_name}
      </td>

      <td className="p-4">
        {item.quantity}
      </td>

      <td className="p-4">
        {item.quantity === 0 ? (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
            نافد
          </span>
        ) : item.quantity < 10 ? (
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
            منخفض
          </span>
        ) : (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
            متوفر
          </span>
        )}
      </td>

      {/* العمليات */}
      <td className="p-4">
        <div className="flex gap-2">

          <button
            onClick={() => openEdit(item)}
            className=" text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-200"
          >
            ✏️
          </button>

          <button
            onClick={() => openDeleteDialog(item.product_id)}
            className=" text-red-600 px-3 py-2 rounded-lg hover:bg-red-200"
          >
            🗑️
          </button>

        </div>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
  <DialogContent className="sm:max-w-md">

    <DialogHeader>
      <DialogTitle className="text-right">
        تعديل المخزون
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-4">

      <div>
        <Label>المنتج</Label>

        <Input
          value={selectedItem?.product_name || ""}
          disabled
        />
      </div>

      <div>
        <Label>الكمية الجديدة</Label>

        <Input
          type="number"
          min={0}
          value={editQuantity}
          onChange={(e) =>
            setEditQuantity(Number(e.target.value))
          }
        />
      </div>

      <div className="flex justify-end gap-3">

        <button
          type="button"
          onClick={() => setEditOpen(false)}
          className="border px-4 py-2 rounded-xl"
        >
          إلغاء
        </button>

        <button
          type="button"
          onClick={handleUpdateStock}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl"
        >
          حفظ التعديل
        </button>

      </div>

    </div>

  </DialogContent>
</Dialog>
<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
  <DialogContent className="sm:max-w-md">

    <DialogHeader>
      <DialogTitle className="text-right text-red-600">
        تأكيد الحذف
      </DialogTitle>
    </DialogHeader>

    <p className="text-gray-600 text-right">
      هل أنت متأكد من حذف هذا المنتج من المخزون؟
      لا يمكن التراجع عن هذا الإجراء.
    </p>

    <div className="flex justify-end gap-3 mt-4">

      <button
        type="button"
        onClick={() => setDeleteOpen(false)}
        className="border px-4 py-2 rounded-xl"
      >
        إلغاء
      </button>

      <button
        type="button"
        onClick={handleDeleteStock}
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl"
      >
        حذف
      </button>

    </div>

  </DialogContent>
</Dialog>
    </div>
  );
}