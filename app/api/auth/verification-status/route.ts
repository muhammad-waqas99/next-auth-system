import connectToDB from "@/app/dbconfig/db";
import User from "@/app/models/user.model";
import { verificationStatusSchema } from "@/app/lib/validationSchema/auth.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();

    const result = verificationStatusSchema.safeParse(reqBody);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          isVerified: false,
          message: result.error.issues[0].message,
        },
        { status: 400 }
      );
    }


    const { email } = result.data;

    await connectToDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          isVerified: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        {
          success: true,
          isVerified: true,
          message: "Email is already verified",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        isVerified: false,
        message: "Email is not verified yet",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Verification status error:", error.message);

    return NextResponse.json(
      {
        success: false,
        isVerified: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}