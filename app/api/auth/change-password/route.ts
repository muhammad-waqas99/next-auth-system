import { NextRequest, NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import { changePasswordSchema } from "@/app/lib/validationSchema/auth.schema";
import requireAuth from "@/app/lib/auth/requireAuth";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { InvalidPasswordError } from "@/app/lib/errors/InvalidPasswordError";
import { hashPassword } from "@/app/lib/auth/password/password";

interface TokenPayload {
  id: string;
  type: "access";
}

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    const reqBody: ChangePasswordBody = await request.json();

    const result = changePasswordSchema.safeParse(reqBody);

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
      currentPassword,
      newPassword,
      confirmPassword,
    } = result.data;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

  

    const {user} = await requireAuth(request,{
      includePassword :true
    })



  

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Password login is not available for this account.",
        },
        { status: 400 }
      );
    }

    const checkPassword =  await comparePassword(
  currentPassword,
  user.password
);

if (!checkPassword) {
  throw new InvalidPasswordError();
}

    if (!checkPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect current password",
        },
        { status: 401 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message:
            "New password and confirm password do not match",
        },
        { status: 400 }
      );
    }

  

    const newPasswordHashed = await hashPassword(newPassword)
    user.password = newPasswordHashed;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Change password error:", error.message);

      return errorHandler(error)
  }
}