"use client";

interface Props {
  open: boolean;
  warehouseId: number | null;
  warehouseName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteWarehouseModal({
  open,
  warehouseId,
  warehouseName,
  onClose,
  onSuccess,
}: Props) {
  if (!open) return null;

  async function handleDelete() {
    if (!warehouseId) return;

    const res = await fetch(`/api/warehouses?id=${warehouseId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      onSuccess();
      onClose();
    } else {
      alert("فشل حذف المخزن");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[420px] p-6">

        <h2 className="text-xl font-bold text-red-600 mb-4">
          حذف المخزن
        </h2>

        <p className="mb-6">
          هل أنت متأكد من حذف المخزن
          <span className="font-bold"> "{warehouseName}" </span>
          ؟
        </p>

        <div className="flex justify-end gap-3">

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border"
          >
            إلغاء
          </button>

          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-lg bg-red-600 text-white"
          >
            حذف
          </button>

        </div>

      </div>

    </div>
  );
}