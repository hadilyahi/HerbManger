"use client";

import { useEffect, useState } from "react";
import { Trash2, Pencil, MoreVertical, Plus } from "lucide-react";
import CreateInvoiceModal from "../../Components/popup/CreateInvoiceModal";
import InvoiceDetailsModal from "../../Components/popup/InvoiceDetailsModal";
import DeleteInvoiceModal from "../../Components/popup/DeleteInvoiceModal";
import EditInvoiceModal from "../../Components/popup/EditInvoiceModal";

interface Invoice {
  id: number;
  invoice_date: string;
  total_amount: number;
  paid_amount: number;
  remaining: number;
  supplier_name: string;
  items_count: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  // فلترة حسب التاريخ
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // ✅ تعريف fetchInvoices مرة واحدة لاستخدامها في كل مكان
  const fetchInvoices = async () => {
    try {
      const res = await fetch("/api/invoices");
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
    }
  };

  useEffect(() => {
  const loadInvoices = async () => {
    await fetchInvoices(); // تحميل الفواتير
  };

  loadInvoices();
}, []);

  // تطبيق فلترة التاريخ
  const filteredInvoices = invoices.filter((inv) => {
    if (!startDate && !endDate) return true;
    const invoiceDate = new Date(inv.invoice_date).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

    if (start && end) return invoiceDate >= start && invoiceDate <= end;
    if (start) return invoiceDate >= start;
    if (end) return invoiceDate <= end;
    return true;
  });

  return (
    <div className="bg-white min-h-screen px-16 pt-12">
      <h1 className="text-4xl font-bold text-center mb-14">إدارة الفواتير</h1>

      {/* TOP ACTIONS */}
      <div className="flex flex-wrap gap-4 mb-8 items-center">
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-300 text-black px-6 py-3 rounded-xl font-semibold"
        >
          <Plus size={18} />
          إضافة فاتورة جديدة
        </button>

        <div className="flex gap-2 items-center bg-gray-200 px-4 py-2 rounded-xl">
          <span>من:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-1 rounded border"
          />
          <span>إلى:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2 py-1 rounded border"
          />
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="bg-red-400 text-white px-3 py-1 rounded"
          >
            مسح الفلترة
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden border border-green-700">
        <table className="w-full text-right border-collapse">
          <thead className="bg-green-300 text-black font-bold">
            <tr>
              <th className="p-4 border border-green-700">رقم الفاتورة</th>
              <th className="p-4 border border-green-700">تاريخ الفاتورة</th>
              <th className="p-4 border border-green-700">عدد المنتجات</th>
              <th className="p-4 border border-green-700">مبلغ الفاتورة الاجمالي</th>
              <th className="p-4 border border-green-700">التفاصيل</th>
            </tr>
          </thead>

          <tbody className="bg-green-100">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="p-4 border border-green-700 text-center">{invoice.id}</td>
                <td className="p-4 border border-green-700 text-center">
                  {new Date(invoice.invoice_date).toLocaleDateString()}
                </td>
                <td className="p-4 border border-green-700 text-center">{invoice.items_count}</td>
                <td className="p-4 border border-green-700 text-center">{invoice.total_amount} دج</td>
                <td className="p-4 border border-green-700">
                  <div className="flex justify-center gap-4">
                    <Trash2
                      size={18}
                      className="text-red-600 cursor-pointer"
                      onClick={() => {
                        setSelectedInvoiceId(invoice.id);
                        setShowDelete(true);
                      }}
                    />
                    <Pencil
                      size={18}
                      className="text-blue-600 cursor-pointer"
                      onClick={() => {
                        setSelectedInvoiceId(invoice.id);
                        setShowEdit(true);
                      }}
                    />
                    <MoreVertical
                      size={18}
                      className="cursor-pointer"
                      onClick={() => {
                        setSelectedInvoiceId(invoice.id);
                        setShowDetails(true);
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}

            {filteredInvoices.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  لا توجد فواتير للعرض
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {showModal && (
        <CreateInvoiceModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchInvoices}
        />
      )}

      {showDetails && selectedInvoiceId && (
        <InvoiceDetailsModal
          invoice={invoices.find((inv) => inv.id === selectedInvoiceId)}
          onClose={() => setShowDetails(false)}
        />
      )}

      {showDelete && selectedInvoiceId && (
        <DeleteInvoiceModal
          invoiceId={selectedInvoiceId}
          onClose={() => setShowDelete(false)}
          onSuccess={fetchInvoices}
        />
      )}

      {showEdit && selectedInvoiceId && (
        <EditInvoiceModal
          invoiceId={selectedInvoiceId}
          onClose={() => setShowEdit(false)}
          onSuccess={fetchInvoices}
        />
      )}
    </div>
  );
}
