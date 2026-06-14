"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Product = {
  id: number;
  name: string;
};

export function AddStoreProductDialog({
  storeId,
}: {
  storeId: number;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [productId, setProductId] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [lastPrice, setLastPrice] =
    useState(0);

  const [purchasePrice, setPurchasePrice] =
    useState(0);

  const [sellingPrice, setSellingPrice] =
    useState(0);

  const [useLastPrice, setUseLastPrice] =
    useState(true);
    const [search, setSearch] = useState("");
const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!open) return;

    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts);
  }, [open]);

  useEffect(() => {
    if (!productId) return;

    fetch(
      `/api/products/${productId}/last-price`
    )
      .then((r) => r.json())
      .then((data) => {
        const price = Number(
          data.purchase_price || 0
        );

        setLastPrice(price);

        if (useLastPrice) {
          setPurchasePrice(price);
        }
      });
  }, [productId, useLastPrice]);
  const filteredProducts = useMemo(() => {
  if (!search) return products;

  return products.filter((p) =>
    p.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );
}, [search, products]);
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
    if (!productId) return;

    await fetch(
      `/api/stores/${storeId}/products`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
          purchasePrice,
          sellingPrice,
        }),
      }
    );

    setOpen(false);

    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>

        <Button className="bg-green-700 hover:bg-green-800">
          <Plus className="w-4 h-4 ml-2" />
          إضافة منتج
        </Button>

      </DialogTrigger>

      <DialogContent className="max-w-3xl">

        <DialogHeader>

          <DialogTitle>
            إضافة منتج للمحل
          </DialogTitle>

        </DialogHeader>

        <div className="space-y-4">

          <div>

            <label className="text-sm font-medium">
              المنتج
            </label>

            <div className="relative mt-1">

  <Input
    placeholder="ابحث عن منتج..."
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setShowResults(true);
    }}
  />

  {showResults && filteredProducts.length > 0 && (
    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">

      {filteredProducts.map((product) => (
        <div
          key={product.id}
          className="p-2 cursor-pointer hover:bg-gray-100"
          onClick={() => {
            setProductId(
              String(product.id)
            );

            setSearch(product.name);

            setShowResults(false);
          }}
        >
          {product.name}
        </div>
      ))}

    </div>
  )}

</div>

          </div>

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
                  Number(
                    e.target.value
                  )
                )
              }
            />

          </div>

          <div className="space-y-2">

            <label>
              سعر الشراء
            </label>

            <div className="flex gap-4">

              <label className="flex gap-2 items-center">

                <input
                  type="radio"
                  checked={
                    useLastPrice
                  }
                  onChange={() =>
                    setUseLastPrice(
                      true
                    )
                  }
                />

                آخر سعر شراء
                ({lastPrice})

              </label>

              <label className="flex gap-2 items-center">

                <input
                  type="radio"
                  checked={
                    !useLastPrice
                  }
                  onChange={() =>
                    setUseLastPrice(
                      false
                    )
                  }
                />

                سعر جديد

              </label>

            </div>

            <Input
              type="number"
              value={purchasePrice}
              disabled={
                useLastPrice
              }
              onChange={(e) =>
                setPurchasePrice(
                  Number(
                    e.target.value
                  )
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
                  Number(
                    e.target.value
                  )
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
            حفظ
          </Button>

        </div>

      </DialogContent>

    </Dialog>
  );
}