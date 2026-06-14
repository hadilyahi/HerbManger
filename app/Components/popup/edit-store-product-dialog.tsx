"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function EditStoreProductDialog({
  storeId,
  productId,
  quantity: initialQuantity,
  purchasePrice: initialPurchasePrice,
  sellingPrice: initialSellingPrice,
}: {
  storeId: number;
  productId: number;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [quantity, setQuantity] = useState(
    initialQuantity
  );

  const [purchasePrice, setPurchasePrice] =
    useState(initialPurchasePrice);

  const [sellingPrice, setSellingPrice] =
    useState(initialSellingPrice);

  const totalCost = useMemo(() => {
    return quantity * purchasePrice;
  }, [quantity, purchasePrice]);

  const totalSales = useMemo(() => {
    return quantity * sellingPrice;
  }, [quantity, sellingPrice]);

  const totalProfit = useMemo(() => {
    return totalSales - totalCost;
  }, [totalSales, totalCost]);

  async function handleSave() {
    const res = await fetch(
      `/api/stores/${storeId}/products/${productId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity,
          purchasePrice,
          sellingPrice,
        }),
      }
    );

    if (!res.ok) {
      alert("حدث خطأ أثناء التعديل");
      return;
    }

    setOpen(false);

    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
        >
          <Pencil className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            تعديل المنتج
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <div>
            <label>
              الكمية
            </label>

            <Input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Number(e.target.value)
                )
              }
            />
          </div>

          <div>
            <label>
              سعر الشراء
            </label>

            <Input
              type="number"
              value={purchasePrice}
              onChange={(e) =>
                setPurchasePrice(
                  Number(e.target.value)
                )
              }
            />
          </div>

          <div>
            <label>
              سعر البيع
            </label>

            <Input
              type="number"
              value={sellingPrice}
              onChange={(e) =>
                setSellingPrice(
                  Number(e.target.value)
                )
              }
            />
          </div>

          <div className="border rounded-lg p-4 bg-muted/30">

            <div className="flex justify-between">
              <span>
                تكلفة المخزون
              </span>

              <span>
                {totalCost.toLocaleString()} دج
              </span>
            </div>

            <div className="flex justify-between mt-2">
              <span>
                قيمة البيع
              </span>

              <span>
                {totalSales.toLocaleString()} دج
              </span>
            </div>

            <div className="flex justify-between mt-2 font-bold text-green-700">
              <span>
                الربح المتوقع
              </span>

              <span>
                {totalProfit.toLocaleString()} دج
              </span>
            </div>

          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-green-700 hover:bg-green-800"
          >
            حفظ التعديلات
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}