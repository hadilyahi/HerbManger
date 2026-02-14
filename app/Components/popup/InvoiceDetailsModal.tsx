// Define or import the Invoice type
// import { Invoice } from '../../types/Invoice'; // Uncomment and adjust the path if you have a type definition elsewhere
type Invoice = {
  id: number;
  invoice_date: string;
  supplier_name: string;
  items_count: number;
  total_amount: number;
  paid_amount: number;
  remaining: number;
};

interface InvoiceDetailsModalProps {
  invoice: Invoice | undefined;
  onClose: () => void;
}

export default function InvoiceDetailsModal({ invoice, onClose }: InvoiceDetailsModalProps) {
  if (!invoice) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white p-6 rounded-xl w-96">
        <h2 className="text-xl font-bold mb-4">تفاصيل الفاتورة #{invoice.id}</h2>
        <p><strong>التاريخ:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
        <p><strong>المورد:</strong> {invoice.supplier_name}</p>
        <p><strong>عدد المنتجات:</strong> {invoice.items_count}</p>
        <p><strong>المبلغ الاجمالي:</strong> {invoice.total_amount} دج</p>
        <p><strong>المبلغ المدفوع:</strong> {invoice.paid_amount} دج</p>
        <p><strong>المبلغ المتبقي:</strong> {invoice.remaining} دج</p>

        <button
          onClick={onClose}
          className="mt-4 bg-green-300 px-4 py-2 rounded-lg font-semibold"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}
