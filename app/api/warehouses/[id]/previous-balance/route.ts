import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";


export async function PUT(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id:string }>;
  }
) {

  try {

    const {id} = await params;

    const body = await request.json();

    const {amount} = body;


    await query(
      `
      UPDATE warehouses
      SET previous_balance = ?
      WHERE id = ?
      `,
      [
        amount,
        id
      ]
    );


    return NextResponse.json({
      message:"تم تحديث الدين السابق"
    });


  } catch(error){

    console.error(error);

    return NextResponse.json(
      {
        message:"حدث خطأ"
      },
      {
        status:500
      }
    );

  }

}