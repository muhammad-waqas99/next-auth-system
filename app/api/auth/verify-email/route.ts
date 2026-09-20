import connectToDB from "@/app/dbconfig/db";
import User from "@/app/models/user.model";
import { verifyEmailSchema } from "@/app/lib/validationSchema/auth.schema";
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";

export async function POST(request: NextRequest) {
  try {
const body = await request.json();

const {token  } = validateRequest(
  verifyEmailSchema,
  body
);

    await connectToDB();

    const user = await User.findOne({
      verificationToken: token,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired verification token",
        },
        { status: 401 }
      );
    }

    const isExpired =
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry.getTime() < Date.now();

    if (isExpired) {
      return NextResponse.json(
        {
          success: false,
          message: "Verification link has expired",
        },
        { status: 400 }
      );
    }

    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    user.isVerified = true;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Email verification error:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}