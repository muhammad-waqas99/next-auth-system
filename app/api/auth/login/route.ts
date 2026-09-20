import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/app/models/user.model";

import connectToDB from "@/app/dbconfig/db";
import { loginSchema } from "@/app/lib/validationSchema/auth.schema";

import { createLoginChallenge } from "@/app/lib/auth/login/createLoginChallenge";
import { createLoginSession } from "@/app/lib/auth/login/createLoginSession";
import { getDeviceInfo } from "@/app/lib/auth/device/getDeviceInfo";
import { setAuthCookies } from "@/app/lib/auth/cookies/cookies";

interface ReqBody {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const reqBody: ReqBody = await request.json();

    const result = loginSchema.safeParse(reqBody);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findOne({ email });

    if (user && user.authProvider === "google") {
      return NextResponse.json({
        success: false,
        message: "Password login is not available for this account.",
      });
    }

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json({
        success: false,
        message: "Password login is not available for this account.",
      });
    }

    const checkPassword = await bcrypt.compare(password, user.password);

    if (!checkPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please verify your email before logging in. Check your inbox for the verification link.",
        },
        { status: 403 }
      );
    }


    if (user.twoFactorEnabled) {
      const loginChallenge = await createLoginChallenge(user.id);

      return NextResponse.json(
        {
          success: true,
          requiresTwoFactor: true,
          challenge: loginChallenge,
          message: "Two-factor authentication required",
        },
        { status: 200 }
      );
    }



    const { browser, os, device } = getDeviceInfo(request);

    const { accessToken, refreshToken } = await createLoginSession({
      userId: user.id,
      browser,
      os,
      device,
    });



    const response = NextResponse.json(
      {
        success: true,
        message: "Logged in successfully",
      },
      { status: 200 }
    );

setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error: any) {
    console.log("Login error:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}