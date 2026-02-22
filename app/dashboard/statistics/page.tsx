"use client";

import { useEffect, useMemo, useState, ReactElement } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";

/* =======================
   Interfaces
======================= */
interface ProductStat {
  month: number;
  total_quantity: number;
  avg_purchase_price: number;
  avg_selling_price: number;
}

interface TopProduct {
  product_id: number;
  product_name: string;
  total_quantity: number;
}

interface SupplierDebt {
  supplier_id: number;
  supplier_name: string;
  total_invoices: number;
  paid: number;
  remaining: number;
}

interface Product {
  id: number;
  name: string;
}

/* =======================
   Page
======================= */
export default function StatisticsPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [productId, setProductId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const [productStats, setProductStats] = useState<ProductStat[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [suppliersDebt, setSuppliersDebt] = useState<SupplierDebt[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);

  /* =======================
     Fetch data
  ======================= */
  useEffect(() => {
    fetch(
      `/api/statistics?year=${year}${productId ? `&productId=${productId}` : ""}`
    )
      .then((res) => res.json())
      .then((data) => {
        setProductStats(data.productStats || []);
        setTopProducts(data.topProducts || []);
        setSuppliersDebt(data.suppliersDebt || []);
        setProductsList(data.productsList || []);
      })
      .catch(console.error);
  }, [year, productId]);

  /* =======================
     Monthly chart data
  ======================= */
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const stat = productStats.find((p) => p.month === i + 1);
    return {
      month: `شهر ${i + 1}`,
      quantity: stat?.total_quantity ?? 0,
      purchasePrice: stat?.avg_purchase_price ?? 0,
      sellingPrice: stat?.avg_selling_price ?? 0,
    };
  });

  /* =======================
     Search products
  ======================= */
  const filteredProducts = useMemo(
    () =>
      productsList.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      ),
    [productsList, search]
  );

  /* =======================
     Top products by quantity
  ======================= */
  const sortedTopProducts = useMemo(
    () =>
      [...topProducts].sort(
        (a, b) => b.total_quantity - a.total_quantity
      ),
    [topProducts]
  );

  /* =======================
     Render
  ======================= */
  return (
    <div className="p-8 space-y-12">
      <h1 className="text-3xl font-bold text-center">
        لوحة الإحصائيات
      </h1>

      {/* ================= Filters ================= */}
      <div className="flex flex-wrap justify-center gap-6 bg-white p-6 rounded-xl shadow">
        <div>
          <label className="block mb-1 font-medium">السنة</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            {[2026, 2025, 2024].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="w-64">
          <label className="block mb-1 font-medium">المنتج</label>
          <input
            type="text"
            placeholder="بحث عن منتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded px-3 py-2 mb-2"
          />
          <select
            className="w-full border rounded px-3 py-2"
            value={productId ?? ""}
            onChange={(e) =>
              setProductId(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">جميع المنتجات</option>
            {filteredProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= Product Charts ================= */}
      {productId && (
        <div className="grid lg:grid-cols-2 gap-8">
          <ChartCard title="تطور الكمية">
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="quantity"
                stroke="#6366f1"
                strokeWidth={3}
              />
            </LineChart>
          </ChartCard>

          <ChartCard title="تطور سعر الشراء">
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="purchasePrice"
                stroke="#10b981"
                strokeWidth={3}
              />
            </LineChart>
          </ChartCard>

          <ChartCard title="تطور سعر البيع">
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="sellingPrice"
                stroke="#f97316"
                strokeWidth={3}
              />
            </LineChart>
          </ChartCard>
        </div>
      )}

      {/* ================= Top Products ================= */}
      <ChartCard title="المنتجات الأكثر شراءً (حسب الكمية)">
        <BarChart data={sortedTopProducts}>
          <XAxis dataKey="product_name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total_quantity" fill="#6366f1" />
        </BarChart>
      </ChartCard>

      {/* ================= Suppliers Debt ================= */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">
          الديون والمدفوعات للموردين
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-right border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">المورد</th>
                <th className="p-3">إجمالي الفواتير</th>
                <th className="p-3">المدفوع</th>
                <th className="p-3">المتبقي</th>
              </tr>
            </thead>
            <tbody>
              {suppliersDebt.map((s) => (
                <tr
                  key={s.supplier_id}
                  className="hover:bg-gray-50"
                >
                  <td className="p-3">{s.supplier_name}</td>
                  <td className="p-3">
                    {s.total_invoices.toLocaleString()} دج
                  </td>
                  <td className="p-3 text-green-600">
                    {s.paid.toLocaleString()} دج
                  </td>
                  <td className="p-3 text-red-600">
                    {s.remaining.toLocaleString()} دج
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =======================
   Reusable Chart Card
======================= */
function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactElement;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}