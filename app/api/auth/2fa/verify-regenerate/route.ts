
import requireAuth from "@/app/lib/auth/requireAuth";
import {
  generateBackupCodes,

  hashRegenerateChallenge,
} from "@/app/lib/auth/token/token";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { verifyOtpSchema } from "@/app/lib/validationSchema/auth.schema";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import BackupCode from "@/app/models/backupCode.model";
import RegenerateChallenge from "@/app/models/backupCodeRegenerateChallenge.model";
;
import { NextRequest, NextResponse } from "next/server";
import { verify } from "otplib";

export async function POST(request: NextRequest) {
  try {
    

    const {user, userId} = await requireAuth(request)
const body = await request.json();

const {challenge,otp  } = validateRequest(
  verifyOtpSchema,
  body
);

    const challengeHash = hashRegenerateChallenge(challenge);

    const regenerateChallenge = await RegenerateChallenge.findOne({
      challengeHash,
    });

    if (!regenerateChallenge) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid regeneration challenge",
        },
        { status: 401 }
      );
    }

    if (regenerateChallenge.usedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Regeneration challenge has already been used",
        },
        { status: 401 }
      );
    }

    if (regenerateChallenge.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Regeneration challenge has expired",
        },
        { status: 401 }
      );
    }

    if (
      regenerateChallenge.userId.toString() !== userId
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid regeneration challenge",
        },
        { status: 401 }
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

    const backupCode = await BackupCode.findOne({
      userId,
    });

    if (!backupCode) {
      return NextResponse.json(
        {
          success: false,
          message: "Backup codes not found",
        },
        { status: 404 }
      );
    }

   
    if (backupCode.lastRegeneratedAt) {
      const cooldown = 30 * 24 * 60 * 60 * 1000;

      const nextAllowedAt =
        backupCode.lastRegeneratedAt.getTime() + cooldown;

      if (Date.now() < nextAllowedAt) {
        return NextResponse.json(
          {
            success: false,
            message: "Backup codes can only be regenerated once every 30 days",
          },
          { status: 429 }
        );
      }
    }

 
    const { codes, hashes } = generateBackupCodes();


    backupCode.codes = hashes.map((codeHash) => ({
      codeHash,
      usedAt: null,
    }));

    backupCode.lastRegeneratedAt = new Date();

    await backupCode.save();

    regenerateChallenge.usedAt = new Date();

    await regenerateChallenge.save();


    return NextResponse.json(
      {
        success: true,
        message: "Backup codes regenerated successfully",
        backupCodes: codes,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log(
      "Verify Regenerate Backup Codes Error:",
      error.message
    );

    return errorHandler(error)
  }
}