import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/app/dbconfig/db";
import User from "@/app/models/user.model";
import LoginChallenge from "@/app/models/loginChallenge.model";
import RefreshToken from "@/app/models/refreshToken.model";
import {
  createAccessToken,
  generateRefreshToken,
  generateSessionId,
  hashRefreshToken,
  hashLoginChallenge,
} from "@/app/lib/auth/token/token";
import { UAParser } from "ua-parser-js";
import { verify } from "otplib";

interface ReqBody {
  challenge: string;
  otp: string;
}

export async function POST(request: NextRequest) {
  try {
    const reqBody: ReqBody = await request.json();

    const { challenge, otp } = reqBody;

    if (!challenge || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Challenge and OTP are required",
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP must be 6 digits",
        },
        { status: 400 }
      );
    }

    await connectToDB();

    const challengeHash = hashLoginChallenge(challenge);

    const loginChallenge = await LoginChallenge.findOne({
      challengeHash,
    });

    if (!loginChallenge) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login challenge",
        },
        { status: 401 }
      );
    }

    if (loginChallenge.usedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Login challenge has already been used",
        },
        { status: 401 }
      );
    }

    if (loginChallenge.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Login challenge has expired",
        },
        { status: 401 }
      );
    }

    const user = await User.findById(loginChallenge.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Two-factor authentication is not enabled",
        },
        { status: 400 }
      );
    }

    const result = await verify({
      secret: user.twoFactorSecret,
      token: otp,
       epochTolerance: 30,
    });

    if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid OTP",
        },
        { status: 401 }
      );
    }

    loginChallenge.usedAt = new Date();
    await loginChallenge.save();

    const accessPayload = {
      id: user.id,
      type: "access",
    };

    const accessToken = createAccessToken(accessPayload);

    const refreshToken = generateRefreshToken();

    const hashedRefreshToken = hashRefreshToken(refreshToken);

    const currentDate = Date.now();

    const expiryDate = new Date(currentDate + 6.048e8);

    const sessionExpiresAt = new Date(currentDate + 2.592e9);

    const sessionId = generateSessionId();

    const userAgent = request.headers.get("user-agent") ?? "";

    const parser = new UAParser(userAgent);

    const browser = parser.getBrowser().name || "Unknown";
    const os = parser.getOS().name || "Unknown";

    const deviceInfo = parser.getDevice();
    const device = deviceInfo.type || "Desktop";

    const newRefreshToken = new RefreshToken({
      userId: user.id,
      expiresAt: expiryDate,
      sessionExpiresAt,
      tokenHash: hashedRefreshToken,
      sessionId,
      os,
      browser,
      device,
    });

    await newRefreshToken.save();

    const response = NextResponse.json(
      {
        success: true,
        message: "Logged in successfully",
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "accessToken",
      value: accessToken,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 15,
    });

    response.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.log("Verify login 2FA error:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}