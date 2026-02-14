"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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
  total_amount: number;
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#FF6699"];

export default function StatisticsPage() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [productId, setProductId] = useState<number | null>(null);

  const [productStats, setProductStats] = useState<ProductStat[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [suppliersDebt, setSuppliersDebt] = useState<SupplierDebt[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);

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
      .catch((err) => console.error(err));
  }, [year, productId]);

  // تحويل بيانات المنتج لكل شهر لتسهيل الرسم
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthStat = productStats.find((ps) => ps.month === i + 1);
    return {
      month: `شهر ${i + 1}`,
      quantity: monthStat?.total_quantity || 0,
      purchasePrice: monthStat?.avg_purchase_price || 0,
      sellingPrice: monthStat?.avg_selling_price || 0,
    };
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        إحصائيات الفواتير والمنتجات
      </h1>

      {/* فلترة السنة والمنتج */}
      <div className="mb-8 flex justify-center gap-4">
        <div>
          <label>اختر السنة: </label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border px-2 py-1 rounded"
          >
            {[2026, 2025, 2024].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>اختر المنتج: </label>
          <select
            value={productId || ""}
            onChange={(e) =>
              setProductId(e.target.value ? Number(e.target.value) : null)
            }
            className="border px-2 py-1 rounded"
          >
            <option value="">-- جميع المنتجات --</option>
            {productsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* تطور المنتج */}
      {productId && (
        <section className="mb-12 border p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">
            تطور المنتج المختار شهريًا
          </h2>
          <LineChart width={700} height={250} data={monthlyData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="quantity"
              stroke="#8884d8"
              name="الكمية"
            />
            <Line
              type="monotone"
              dataKey="purchasePrice"
              stroke="#82ca9d"
              name="سعر الشراء"
            />
            <Line
              type="monotone"
              dataKey="sellingPrice"
              stroke="#FF8042"
              name="سعر البيع"
            />
          </LineChart>
        </section>
      )}

      {/* المنتجات الأكثر شراءً */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">المنتجات الأكثر شراءً</h2>
        <BarChart width={700} height={300} data={topProducts}>
          <XAxis dataKey="product_name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="total_quantity" fill="#8884d8" name="الكمية" />
          <Bar dataKey="total_amount" fill="#82ca9d" name="المبلغ" />
        </BarChart>
      </section>

    
      {/* الديون والمدفوعات للموردين */}
<section className="mb-12">
  <h2 className="text-xl font-semibold ">الديون والمدفوعات للموردين</h2>


  {/* جدول الديون والمدفوعات */}
  <div className="overflow-x-auto mt-6">
    <table className="w-full border-collapse border border-gray-300 text-right">
      <thead className="bg-gray-200 font-bold">
        <tr>
          <th className="p-3 border border-gray-300">المورد</th>
          <th className="p-3 border border-gray-300">إجمالي الفواتير</th>
          <th className="p-3 border border-gray-300">المدفوع</th>
          <th className="p-3 border border-gray-300">المتبقي</th>
        </tr>
      </thead>
      <tbody>
        {suppliersDebt.map((supplier) => (
          <tr key={supplier.supplier_id} className="hover:bg-gray-100">
            <td className="p-3 border border-gray-300">{supplier.supplier_name}</td>
            <td className="p-3 border border-gray-300">{supplier.total_invoices.toLocaleString()} دج</td>
            <td className="p-3 border border-gray-300">{supplier.paid.toLocaleString()} دج</td>
            <td className="p-3 border border-gray-300">{supplier.remaining.toLocaleString()} دج</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>

    </div>
  );
}
