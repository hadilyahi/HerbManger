"use client";

import { useEffect, useState } from "react";

interface Product {
  warehouse_invoice_item_id: number;
  warehouse_invoice_id: number;
  product_id: number;
  product_name: string;
  purchase_price: number;
  remaining_quantity: number;
}

interface Props {
  open: boolean;
  warehouseId: number;
  onClose: () => void;
  onSelect: (product: Product, quantity: number) => void;
}

export default function AddWarehouseProductModal({
  open,
  warehouseId,
  onClose,
  onSelect,
}: Props) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!open) return;

    fetch(
  `/api/warehouses/${warehouseId}/search?q=${search}`
)
      .then((r) => r.json())
      .then(setProducts);
  }, [search, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white rounded-xl w-[900px] p-6">

        <div className="flex justify-between mb-5">

          <h2 className="text-xl font-bold">
            إضافة منتج من المخزن
          </h2>

          <button
            onClick={onClose}
            className="text-red-600 text-xl"
          >
            ✕
          </button>

        </div>

        <input
          className="border rounded-lg p-2 w-full mb-5"
          placeholder="ابحث باسم المنتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="border rounded-lg overflow-auto max-h-[350px]">

          <table className="w-full">

            <thead className="bg-gray-100">

              <tr>

                <th className="p-3">المنتج</th>

                <th className="p-3">الفاتورة</th>

                <th className="p-3">المتبقي</th>

                <th className="p-3">السعر</th>

              </tr>

            </thead>

            <tbody>

              {products.map((product) => (

                <tr
                  key={product.warehouse_invoice_item_id}
                  onClick={() => setSelected(product)}
                  className={`cursor-pointer border-t ${
                    selected?.warehouse_invoice_item_id ===
                    product.warehouse_invoice_item_id
                      ? "bg-green-100"
                      : ""
                  }`}
                >

                  <td className="p-3">
                    {product.product_name}
                  </td>

                  <td className="p-3">
                    #{product.warehouse_invoice_id}
                  </td>

                  <td className="p-3">
                    {product.remaining_quantity}
                  </td>

                  <td className="p-3">
                    {product.purchase_price}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {selected && (

          <div className="mt-5 flex items-center gap-3">

            <label>الكمية</label>

            <input
              type="number"
              min={1}
              max={selected.remaining_quantity}
              value={quantity}
              onChange={(e) =>
                setQuantity(Number(e.target.value))
              }
              className="border rounded-lg p-2 w-28"
            />

            <button
              className="bg-green-600 text-white px-5 py-2 rounded-lg"
              onClick={() => {

                onSelect(selected, quantity);

                onClose();

              }}
            >
              إضافة
            </button>

          </div>

        )}

      </div>

    </div>
  );
}