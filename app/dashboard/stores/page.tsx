import Link from "next/link";
import { Plus } from "lucide-react";

import { query } from "@/lib/db";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AddStoreDialog } from "@/app/Components/popup/add-store-dialog";
type Store = {
  id: number;
  name: string;
  products: number;
  stockValue: number;
  profit: number;
};

export default async function StoresPage() {
  const stores = await query<Store[]>(`
    SELECT
      s.id,
      s.name,

      COUNT(ss.product_id) AS products,

      COALESCE(
        SUM(ss.quantity * ss.purchase_price),
        0
      ) AS stockValue,

      COALESCE(
        SUM(
          ss.quantity *
          (ss.selling_price - ss.purchase_price)
        ),
        0
      ) AS profit

    FROM stores s

    LEFT JOIN store_stock ss
      ON ss.store_id = s.id

    GROUP BY s.id, s.name

    ORDER BY s.name
  `);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-3xl font-bold">
            إدارة المحلات
          </h1>

          <p className="text-muted-foreground">
            إدارة مخزون المحلات والأرباح
          </p>
        </div>

        <AddStoreDialog />

      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/dashboard/stores/${store.id}`}
          >
            <Card className="cursor-pointer transition hover:shadow-lg">

              <CardContent className="p-5">

                <h2 className="mb-4 text-xl font-bold">
                  {store.name}
                </h2>

                <div className="space-y-2 text-sm">

                  <div className="flex justify-between">
                    <span>عدد المنتجات</span>

                    <span className="font-bold">
                      {store.products}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>قيمة المخزون</span>

                    <span className="font-bold">
                      {Number(
                        store.stockValue
                      ).toLocaleString()} دج
                    </span>
                  </div>

                  <div className="flex justify-between text-green-700 font-bold">
                    <span>الربح المتوقع</span>

                    <span>
                      {Number(
                        store.profit
                      ).toLocaleString()} دج
                    </span>
                  </div>

                </div>

              </CardContent>

            </Card>
          </Link>
        ))}

      </div>
    </div>
  );
}