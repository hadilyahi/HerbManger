"use client";

import { X } from "lucide-react";

interface ProductHistory {

  id: number;

  invoice_number: string;

  invoice_date: string;

  supplier: string;

  quantity: number;

  purchase_price: number;

}

interface Props {

  open: boolean;

  onClose: () => void;

  productName: string;

  history: ProductHistory[];

}

export default function ProductHistoryModal({

  open,

  onClose,

  productName,

  history,

}: Props) {

  if (!open) return null;

  return (

    <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center">

      <div className="bg-white w-[900px] rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}

        <div className="bg-gradient-to-r from-emerald-600 to-green-700 text-white flex justify-between items-center px-8 py-5">

          <div>

            <h2 className="text-black mt-8 text-2xl font-bold">

              تفاصيل المنتج

            </h2>

            <p className="text-green-100 mt-1">

              {productName}

            </p>

          </div>

          <button
            onClick={onClose}
            className="bg-black rounded-lg p-2 transition"
          >
            <X size={26} className="text-black"/>
          </button>

        </div>

        {/* Body */}

        <div className="p-6 max-h-[65vh] overflow-y-auto">

          <table className="w-full">

            <thead>

              <tr className="bg-slate-100">

                <th className="p-4 text-right">

                  الفاتورة

                </th>

                <th className="p-4 text-right">

                  التاريخ

                </th>

                <th className="p-4 text-right">

                  المورد

                </th>

                <th className="p-4 text-center">

                  الكمية

                </th>

                <th className="p-4 text-center">

                  سعر الشراء

                </th>

                <th className="p-4 text-center">

                  القيمة

                </th>

              </tr>

            </thead>

            <tbody>

              {history.map((item) => (

                <tr
                  key={item.id}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="p-4">

                    {item.invoice_number}

                  </td>

                  <td className="p-4">

                    {new Date(item.invoice_date).toLocaleDateString("fr-CA")}

                  </td>

                  <td className="p-4">

                    {item.supplier}

                  </td>

                  <td className="p-4 text-center">

                    {item.quantity}

                  </td>

                  <td className="p-4 text-center text-green-700 font-semibold">

                    {Number(item.purchase_price).toFixed(2)} دج

                  </td>

                  <td className="p-4 text-center font-bold">

                    {(item.quantity * item.purchase_price).toFixed(2)} دج

                  </td>

                </tr>

              ))}

              {history.length === 0 && (

                <tr>

                  <td
                    colSpan={6}
                    className="py-10 text-center text-gray-500"
                  >

                    لا توجد عمليات شراء لهذا المنتج

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}