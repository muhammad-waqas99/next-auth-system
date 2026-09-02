import User from "@/app/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import connectToDB from "@/app/dbconfig/db";
import { resetPasswordSchema } from "@/app/lib/validationSchema/auth.schema";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
  console.log("reset api hit")

    const result = resetPasswordSchema.safeParse(reqBody);
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0].message,
        },
        { status: 400 }
      );
    }
        const {
      password,
      plainToken,
      confirmPassword
    } = result.data;


    if (!password || !plainToken || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

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

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(
      password,
      salt
    );

    user.password = hashPassword;


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