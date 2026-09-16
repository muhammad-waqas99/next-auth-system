import connectToDB from "@/app/dbconfig/db";
import {
  hashDisableChallenge,
  hashRefreshToken,
} from "@/app/lib/auth/token";
import RefreshToken from "@/app/models/refreshToken.model";
import DisableChallenge from "@/app/models/twoFactorDisableChallenge.model";
import User from "@/app/models/user.model";
import { verify } from "otplib";
import { NextRequest, NextResponse } from "next/server";

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

    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectToDB();


    const hashedRefreshToken = hashRefreshToken(refreshToken);

    const refreshTokenCheck = await RefreshToken.findOne({
      tokenHash: hashedRefreshToken,
    });

    if (!refreshTokenCheck) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired refresh token",
        },
        { status: 401 }
      );
    }


    const currentUserId = refreshTokenCheck.userId;

    const challengeHash = hashDisableChallenge(challenge);

    const disableChallenge = await DisableChallenge.findOne({
      challengeHash,
    });

    if (!disableChallenge) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid disable challenge",
        },
        { status: 401 }
      );
    }

    if (disableChallenge.usedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Disable challenge has already been used",
        },
        { status: 401 }
      );
    }

    if (disableChallenge.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Disable challenge has expired",
        },
        { status: 401 }
      );
    }

    if (disableChallenge.userId.toString() !== currentUserId.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid disable challenge",
        },
        { status: 401 }
      );
    }

    const user = await User.findById(currentUserId);

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


    disableChallenge.usedAt = new Date();
    await disableChallenge.save();

  
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "2FA disabled successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Verify-Disable Error:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}