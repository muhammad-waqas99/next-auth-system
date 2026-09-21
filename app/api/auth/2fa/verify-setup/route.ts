import requireAuth from "@/app/lib/auth/requireAuth";
import { generateBackupCodes } from "@/app/lib/auth/token/token";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { verifySetupSchema } from "@/app/lib/validationSchema/auth.schema";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import BackupCode from "@/app/models/backupCode.model";

import { NextRequest, NextResponse } from "next/server";
import { verify } from "otplib";

import { AppError } from "@/app/lib/errors/AppError";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_CODES,
  SUCCESS_MESSAGES,
} from "@/app/lib/errors/messages";

export async function POST(request: NextRequest) {
  try {
    const { user } = await requireAuth(request);

    if (user.twoFactorEnabled) {
      throw new AppError(
        ERROR_CODES.TWO_FACTOR_ALREADY_ENABLED,
        ERROR_MESSAGES.TWO_FACTOR_ALREADY_ENABLED,
        400
      );
    }

    if (
      !user.pendingTwoFactorSecret ||
      !user.pendingTwoFactorExpiresAt
    ) {
      throw new AppError(
        ERROR_CODES.NO_ACTIVE_TWO_FACTOR_SETUP,
        ERROR_MESSAGES.NO_ACTIVE_TWO_FACTOR_SETUP,
        400
      );
    }

    const now = new Date();

    if (user.pendingTwoFactorExpiresAt < now) {
      user.pendingTwoFactorSecret = null;
      user.pendingTwoFactorExpiresAt = null;

      await user.save();

      throw new AppError(
        ERROR_CODES.TWO_FACTOR_SETUP_EXPIRED,
        ERROR_MESSAGES.TWO_FACTOR_SETUP_EXPIRED,
        400
      );
    }

    const body = await request.json();

    const { otpSecret, otp } = validateRequest(
      verifySetupSchema,
      body
    );

    if (user.pendingTwoFactorSecret !== otpSecret) {
      throw new AppError(
        ERROR_CODES.INVALID_TWO_FACTOR_SETUP,
        ERROR_MESSAGES.INVALID_TWO_FACTOR_SETUP,
        401
      );
    }

    const result = await verify({
      secret: user.pendingTwoFactorSecret,
      token: otp,
      epochTolerance: 30,
    });

    if (!result.valid) {
      throw new AppError(
        ERROR_CODES.INVALID_OTP,
        ERROR_MESSAGES.INVALID_OTP,
        401
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
        message: SUCCESS_MESSAGES.TWO_FACTOR_ENABLED,
        code: SUCCESS_CODES.TWO_FACTOR_ENABLED,
        backupCodes: codes,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log(
      "2FA verification error:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}