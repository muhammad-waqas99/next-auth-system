import connectToDB from "@/app/dbconfig/db";
import {
  hashDisableChallenge,
  hashRefreshToken,
} from "@/app/lib/auth/token/token";
import { consumeBackupCode } from "@/app/lib/auth/backup-code/consumeBackupCode";
import RefreshToken from "@/app/models/refreshToken.model";
import DisableChallenge from "@/app/models/twoFactorDisableChallenge.model";
import User from "@/app/models/user.model";
import { verify } from "otplib";
import { NextRequest, NextResponse } from "next/server";
import BackupCode from "@/app/models/backupCode.model";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import requireAuth from "@/app/lib/auth/requireAuth";

interface ReqBody {
  challenge: string;
  otp?: string;
  backupCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    const reqBody: ReqBody = await request.json();

    const { challenge, otp, backupCode } = reqBody;

    if (!challenge) {
      return NextResponse.json(
        {
          success: false,
          message: "Disable challenge is required",
        },
        { status: 400 }
      );
    }

    if (!otp && !backupCode) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP or backup code is required",
        },
        { status: 400 }
      );
    }

    if (otp && backupCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Use either OTP or backup code",
        },
        { status: 400 }
      );
    }

    if (otp && !/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        {
          success: false,
          message: "OTP must be 6 digits",
        },
        { status: 400 }
      );
    }

    await connectToDB()
 const {userId , user} = await requireAuth(request)
    const currentUserId = userId

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

    if (
      disableChallenge.userId.toString() !==
      currentUserId.toString()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid disable challenge",
        },
        { status: 401 }
      );
    }


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

    if (otp) {
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
    }


    if (backupCode) {
      const backupCodeConsumed = await consumeBackupCode(
        currentUserId.toString(),
        backupCode
      );

      if (!backupCodeConsumed) {
        return NextResponse.json(
          {
            success: false,
            message: "Incorrect or already used backup code",
          },
          { status: 401 }
        );
      }
    }

    disableChallenge.usedAt = new Date();
    await disableChallenge.save();
    await BackupCode.deleteOne({
  userId: currentUserId,
});


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

return errorHandler(error)
  }
}