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

  // إضافة مورد
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // تعديل مورد
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // تأكيد الحذف
  const [deleteId, setDeleteId] = useState<number | null>(null);

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


  // إضافة
  const handleSubmit = async () => {
    await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });

    setName("");
    setPhone("");
    setShowForm(false);
    fetchSuppliers();
  };

  // فتح نافذة التعديل
  const openEditModal = (supplier: Supplier) => {
    setEditSupplier(supplier);
    setEditName(supplier.name);
    setEditPhone(supplier.phone || "");
  };

  // حفظ التعديل
  const handleUpdate = async () => {
    if (!editSupplier) return;

    await fetch("/api/suppliers", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editSupplier.id,
        name: editName,
        phone: editPhone,
      }),
    });

    setEditSupplier(null);
    fetchSuppliers();
  };

  // حذف
  const handleDelete = async () => {
    if (!deleteId) return;

    await fetch(`/api/suppliers?id=${deleteId}`, {
      method: "DELETE",
    });

    setDeleteId(null);
    fetchSuppliers();
  };

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">
        إدارة الموردين
      </h1>

      {/* Controls */}
      <div className="flex justify-between mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          + إضافة مورد جديد
        </button>

        <input
          type="text"
          placeholder="ابحث باسم المورد..."
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم المورد"
              className="border px-4 py-2 rounded w-full"
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="رقم الهاتف"
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
                <td className="p-3 flex gap-4">
                  <button
                    onClick={() => openEditModal(supplier)}
                    className="text-blue-600"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => setDeleteId(supplier.id)}
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

      {/* Edit Modal */}
      {editSupplier && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">تعديل المورد</h2>

            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="border p-2 rounded w-full mb-3"
              placeholder="اسم المورد"
            />

            <input
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="border p-2 rounded w-full mb-4"
              placeholder="رقم الهاتف"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditSupplier(null)}
                className="border px-4 py-2 rounded"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-80 text-center">
            <p className="mb-4">
              هل أنت متأكد من حذف هذا المورد؟
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteId(null)}
                className="border px-4 py-2 rounded"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
