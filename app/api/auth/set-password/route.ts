import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import connectToDB from "@/app/dbconfig/db";
import User from "@/app/models/user.model";

import { setPasswordSchema } from "@/app/lib/validationSchema/auth.schema";
import { verifyAccessToken } from "@/app/lib/auth/token/token";

interface AccessTokenPayload {
  id: string;
  type: "access";
}

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();

    const result = setPasswordSchema.safeParse(reqBody);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { newPassword } = result.data;

  
    const accessToken = request.cookies.get("accessToken")?.value;

    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

  
    let decodedToken: AccessTokenPayload;

    try {
      decodedToken = verifyAccessToken(
        accessToken
      ) as AccessTokenPayload;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired access token",
        },
        { status: 401 }
      );
    }

    if (!decodedToken.id || decodedToken.type !== "access") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid access token",
        },
        { status: 401 }
      );
    }

    await connectToDB();

    const user = await User.findById(decodedToken.id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }


    if (user.authProvider !== "google") {
      return NextResponse.json(
        {
          success: false,
          message: "Password is already set for this account",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.authProvider = "both";

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Password set successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Set password error:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}