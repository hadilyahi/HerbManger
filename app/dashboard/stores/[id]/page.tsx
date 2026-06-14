import { query } from "@/lib/db";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Plus,
  ArrowRightLeft,
} from "lucide-react";
import { AddStoreProductDialog } from "@/app/Components/popup/add-store-product-dialog";

export default async function StorePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const stores = await query<any[]>(
    `
      SELECT *
      FROM stores
      WHERE id = ?
    `,
    [id]
  );

  const store = stores[0];

  const products = await query<any[]>(
    `
      SELECT
        p.id,
        p.name,

        ss.quantity,
        ss.purchase_price,
        ss.selling_price

      FROM store_stock ss

      INNER JOIN products p
      ON p.id = ss.product_id

      WHERE ss.store_id = ?

      ORDER BY p.name
    `,
    [id]
  );

  const totalCost = products.reduce(
    (sum, p) =>
      sum +
      Number(p.quantity) *
        Number(p.purchase_price),
    0
  );

  const totalSales = products.reduce(
    (sum, p) =>
      sum +
      Number(p.quantity) *
        Number(p.selling_price),
    0
  );

  const totalProfit =
    totalSales - totalCost;

  return (
    <div className="p-6 space-y-6">

      <div>
        <h1 className="text-3xl font-bold flex justify-center">
          {store?.name}
        </h1>

        <p className="text-muted-foreground flex justify-center">
          إدارة مخزون المحل
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">

        <Card>
          <CardContent className="p-4">
            <p className="text-gray-500">
              تكلفة المخزون
            </p>

            <h2 className="text-2xl font-bold">
              {totalCost.toLocaleString()} دج
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-gray-500">
              قيمة البيع
            </p>

            <h2 className="text-2xl font-bold">
              {totalSales.toLocaleString()} دج
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-gray-500">
              الربح المتوقع
            </p>

            <h2 className="text-2xl font-bold text-green-700">
              {totalProfit.toLocaleString()} دج
            </h2>
          </CardContent>
        </Card>

      </div>

      <div className="flex gap-3">

        <AddStoreProductDialog
  storeId={Number(id)}
/>

        <Button variant="outline">
          <ArrowRightLeft className="w-4 h-4 ml-2" />
          تحويل من المخزن
        </Button>

      </div>

      <Card>

        <CardContent className="p-0 overflow-x-auto">

          <table className="w-full">

            <thead className="bg-green-700 text-white">

              <tr>

                <th className="p-3 text-right">
                  المنتج
                </th>

                <th className="p-3">
                  الكمية
                </th>

                <th className="p-3">
                  شراء
                </th>

                <th className="p-3">
                  بيع
                </th>

                <th className="p-3">
                  التكلفة
                </th>

                <th className="p-3">
                  قيمة البيع
                </th>

                <th className="p-3">
                  الربح
                </th>

              </tr>

            </thead>

            <tbody>

              {products.map((product) => {

                const cost =
                  Number(product.quantity) *
                  Number(product.purchase_price);

                const sales =
                  Number(product.quantity) *
                  Number(product.selling_price);

                const profit =
                  sales - cost;

                return (
                  <tr
                    key={product.id}
                    className="border-b"
                  >

                    <td className="p-3">
                      {product.name}
                    </td>

                    <td className="p-3 text-center">
                      {product.quantity}
                    </td>

                    <td className="p-3 text-center">
                      {product.purchase_price}
                    </td>

                    <td className="p-3 text-center">
                      {product.selling_price}
                    </td>

                    <td className="p-3 text-center">
                      {cost.toLocaleString()}
                    </td>

                    <td className="p-3 text-center">
                      {sales.toLocaleString()}
                    </td>

                    <td className="p-3 text-center font-bold text-green-700">
                      {profit.toLocaleString()}
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </CardContent>

      </Card>

    </div>
  );
}