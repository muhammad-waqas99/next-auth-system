import User from "@/app/models/user.model";

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import connectToDB from "@/app/dbconfig/db";
import { resetPasswordSchema } from "@/app/lib/validationSchema/auth.schema";
import { hashPassword } from "@/app/lib/auth/password/password";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";

export async function POST(request: NextRequest) {
  try {
const body = await request.json();

const { plainToken, confirmPassword, password } = validateRequest(
  resetPasswordSchema,
  body
);





    const hashToken = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");

    await connectToDB();

    const user = await User.findOne({
      resetPasswordToken: hashToken,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reset password token",
        },
        { status: 401 }
      );
    }

    
    if (
      !user.resetPasswordTokenExpiry ||
      user.resetPasswordTokenExpiry.getTime() <
        Date.now()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Reset password link has expired",
        },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password and confirm password do not match",
        },
        { status: 400 }
      );
    }

    

    const hashedPassword = await hashPassword(
      password
    );

    user.password = hashedPassword;


    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    user.passwordResetAt = new Date();

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully",
      },
      { status: 200 }
    );

  } catch (error:any) {

     console.log("Reset password error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}