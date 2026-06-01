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
  invoice_date: string;
  total_quantity: number;
  purchase_price: number;
  selling_price: number;
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
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

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
    if (!startDate || !endDate) return;

    fetch(
      `/api/statistics?startDate=${startDate}&endDate=${endDate}${
        productId ? `&productId=${productId}` : ""
      }`
    )
      .then((res) => res.json())
      .then((data) => {
        setProductStats(data.productStats || []);
        setTopProducts(data.topProducts || []);
        setSuppliersDebt(data.suppliersDebt || []);
        setProductsList(data.productsList || []);
      })
      .catch(console.error);
  }, [startDate, endDate, productId]);

  /* =======================
     Auto default (آخر 30 يوم)
  ======================= */
  useEffect(() => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);

    setStartDate(lastMonth.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  /* =======================
     🔥 FIX: chart data (timestamp)
  ======================= */
  const chartData = useMemo(
    () =>
      productStats
        .map((p) => ({
          date: new Date(p.invoice_date).getTime(), // مهم جدًا
          label: p.invoice_date,
          quantity: p.total_quantity,
          purchasePrice: p.purchase_price,
          sellingPrice: p.selling_price,
        }))
        .sort((a, b) => a.date - b.date), // مهم للترتيب بين السنوات
    [productStats]
  );

  /* =======================
     Date formatter
  ======================= */
  const formatDate = (value: number) => {
    return new Date(value).toLocaleDateString("ar-DZ", {
      day: "2-digit",
      month: "short",
    });
  };

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
     Top products
  ======================= */
  const sortedTopProducts = useMemo(
    () =>
      [...topProducts].sort(
        (a, b) => b.total_quantity - a.total_quantity
      ),
    [topProducts]
  );

  return (
    <div className="p-8 space-y-12">
      <h1 className="text-3xl font-bold text-center">
        لوحة الإحصائيات
      </h1>

      {/* ================= Filters ================= */}
      <div className="flex flex-wrap justify-center gap-6 bg-white p-6 rounded-xl shadow">

        <div className="flex flex-col">
          <label className="block mb-1 font-medium">من تاريخ</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        <div className="flex flex-col">
          <label className="block mb-1 font-medium">إلى تاريخ</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-3 py-2"
          />
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
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("ar-DZ")
                }
              />
              <Line
                dataKey="quantity"
                stroke="#6366f1"
                strokeWidth={3}
              />
            </LineChart>
          </ChartCard>

          <ChartCard title="تطور سعر الشراء">
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
                height={60}
              />
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
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
                height={60}
              />
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
      <ChartCard title="المنتجات الأكثر شراءً">
        <BarChart data={sortedTopProducts}>
          <XAxis dataKey="product_name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total_quantity" fill="#6366f1" />
        </BarChart>
      </ChartCard>
    </div>
  );
}

/* =======================
   Chart Card
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