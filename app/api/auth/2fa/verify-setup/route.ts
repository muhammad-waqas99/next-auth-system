import connectToDB from "@/app/dbconfig/db";
import requireAuth from "@/app/lib/auth/requireAuth";
import { generateBackupCodes, hashRefreshToken } from "@/app/lib/auth/token/token";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import BackupCode from "@/app/models/backupCode.model";
import RefreshToken from "@/app/models/refreshToken.model";

import { NextRequest, NextResponse } from "next/server";
import { verify } from "otplib";

export async function POST(request: NextRequest) {
  try {
      await connectToDB()
      const {user , userId }= await requireAuth(request)
  
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: "2FA is already enabled",
        },
        { status: 400 }
      );
    }

    if (
      !user.pendingTwoFactorSecret ||
      !user.pendingTwoFactorExpiresAt
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "No active 2FA setup found",
        },
        { status: 400 }
      );
    }

    const now = new Date();

    if (user.pendingTwoFactorExpiresAt < now) {
      user.pendingTwoFactorSecret = null;
      user.pendingTwoFactorExpiresAt = null;

      await user.save();

      return NextResponse.json(
        {
          success: false,
          message: "2FA setup has expired. Please start again.",
        },
        { status: 400 }
      );
    }

    const reqBody = await request.json();

    const { otpSecret, otp } = reqBody;

    if (!otpSecret || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP and setup secret are required",
        },
        { status: 400 }
      );
    }


    if (user.pendingTwoFactorSecret !== otpSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid 2FA setup",
        },
        { status: 401 }
      );
    }

    const result = await verify({
  secret: user.pendingTwoFactorSecret,
  token: otp,
   epochTolerance: 30,
});



if (!result.valid) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect or expired OTP",
        },
        { status: 401 }
      );
    }
const { codes, hashes } = generateBackupCodes();

await BackupCode.create({
  userId: user._id,
  codes: hashes.map((codeHash) => ({
    codeHash,
    usedAt: null,
  })),
});

 
    user.twoFactorSecret = user.pendingTwoFactorSecret;
    user.twoFactorEnabled = true;


    user.pendingTwoFactorSecret = null;
    user.pendingTwoFactorExpiresAt = null;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "2FA enabled successfully",
        backupCodes:codes
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("2FA verification error:", error.message);

    return errorHandler(error)
  }
}