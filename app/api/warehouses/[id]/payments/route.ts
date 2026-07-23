import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";


// جلب كل الدفعات الخاصة بالمخزن
export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {

    const { id } = await params;


    const payments = await query(
      `
      SELECT 
        id,
        amount,
        payment_date,
        notes
      FROM warehouse_payments
      WHERE warehouse_id = ?
      ORDER BY payment_date DESC
      `,
      [id]
    );


    return NextResponse.json(payments);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        message: "حدث خطأ أثناء جلب الدفعات"
      },
      {
        status:500
      }
    );

  }
}





// إضافة دفعة جديدة
export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {

  try {

    const { id } = await params;

    const body = await request.json();


    const {
      amount,
      notes
    } = body;



    if (!amount) {
      return NextResponse.json(
        {
          message:"المبلغ مطلوب"
        },
        {
          status:400
        }
      );
    }



    await query(
      `
      INSERT INTO warehouse_payments
      (
        warehouse_id,
        amount,
        payment_date,
        notes
      )
      VALUES
      (
        ?,
        ?,
        CURDATE(),
        ?
      )
      `,
      [
        id,
        amount,
        notes || null
      ]
    );



    return NextResponse.json(
      {
        message:"تمت إضافة الدفعة بنجاح"
      },
      {
        status:201
      }
    );


  } catch(error){

    console.error(error);


    return NextResponse.json(
      {
        message:"حدث خطأ أثناء إضافة الدفعة"
      },
      {
        status:500
      }
    );

  }

}