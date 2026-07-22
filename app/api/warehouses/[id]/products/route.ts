        import { NextResponse } from "next/server";
        import { pool } from "@/lib/db";
        import { RowDataPacket } from "mysql2";

        export async function GET(
        req: Request,
        { params }: { params: Promise<{ id: string }> }
        ) {
        const { id } = await params;

        const [rows] = await pool.execute<RowDataPacket[]>(
            `
            SELECT
                p.id,
                p.name,
                ws.quantity,

                (
                    SELECT ii.purchase_price
                    FROM warehouse_purchase_invoice_items ii
                    INNER JOIN warehouse_purchase_invoices inv
                        ON inv.id = ii.invoice_id
                    WHERE ii.product_id = ws.product_id
                    AND inv.warehouse_id = ws.warehouse_id
                    ORDER BY inv.invoice_date DESC, ii.id DESC
                    LIMIT 1
                ) AS last_purchase_price

            FROM warehouse_stock ws

            INNER JOIN products p
                ON p.id = ws.product_id

            WHERE ws.warehouse_id = ?

            ORDER BY p.name;
            `,
            [id]
        );

        return NextResponse.json(rows);
        }