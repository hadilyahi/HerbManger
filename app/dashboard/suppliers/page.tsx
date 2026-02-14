"use client";

import { useEffect, useState } from "react";

interface Supplier {
  id: number;
  name: string;
  phone?: string;
  created_at: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const fetchSuppliers = async () => {
    const res = await fetch("/api/suppliers");
    const data = await res.json();
    setSuppliers(data);
  };

  useEffect(() => {
    const loadSuppliers = async () => {
      await fetchSuppliers();
    };
    loadSuppliers();
  }, []);

  const handleSubmit = async () => {
    await fetch("/api/suppliers", {
      method: "POST",
      body: JSON.stringify({ name, phone }),
    });

    setName("");
    setPhone("");
    setShowForm(false);
    fetchSuppliers();
  };

  const handleDelete = async (id: number) => {
    await fetch("/api/suppliers", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });

    fetchSuppliers();
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">
        إدارة الموردين
      </h1>

      {/* Top Controls */}
      <div className="flex justify-between mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          + إضافة مورد جديد
        </button>

        <input
          type="text"
          placeholder="ابحث باستخدام اسم المورد..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-64"
        />
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="اسم المورد"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border px-4 py-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="الهاتف"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border px-4 py-2 rounded w-full"
            />
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              حفظ
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-green-200">
            <tr>
              <th className="p-3">اسم المورد</th>
              <th className="p-3">رقم الهاتف</th>
              <th className="p-3">تاريخ الإضافة</th>
              <th className="p-3">التحكم</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier.id} className="border-t">
                <td className="p-3">{supplier.name}</td>
                <td className="p-3">{supplier.phone || "-"}</td>
                <td className="p-3">
                  {new Date(supplier.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 flex gap-3">
                  <button
                    onClick={() => handleDelete(supplier.id)}
                    className="text-red-600"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
