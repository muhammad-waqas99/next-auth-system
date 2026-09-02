import connectToDB from "@/app/dbconfig/db";
import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const resetRequestId =
      request.nextUrl.searchParams.get("resetRequestId");

    if (!resetRequestId) {
      return NextResponse.json(
        {
          success: false,
          message: "Reset request ID is required",
        },
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findOne({
      resetRequestId,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reset request",
        },
        { status: 404 }
      );
    }

    const isReset = !!user.passwordResetAt;

    return NextResponse.json(
      {
        success: true,
        isReset,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Reset status error:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}