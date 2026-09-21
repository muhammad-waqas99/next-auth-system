import { hashDisableChallenge } from "@/app/lib/auth/token/token";
import { consumeBackupCode } from "@/app/lib/auth/backup-code/consumeBackupCode";

import DisableChallenge from "@/app/models/twoFactorDisableChallenge.model";
import User from "@/app/models/user.model";
import { verify } from "otplib";
import { NextRequest, NextResponse } from "next/server";
import requireAuth from "@/app/lib/auth/requireAuth";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import { verifyDisableSchema } from "@/app/lib/validationSchema/auth.schema";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { AppError } from "@/app/lib/errors/AppError";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_CODES,
  SUCCESS_MESSAGES,
} from "@/app/lib/errors/messages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { backupCode, challenge, otp } = validateRequest(
      verifyDisableSchema,
      body
    );

    if (otp && backupCode) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        ERROR_MESSAGES.VALIDATION_ERROR,
        400
      );
    }

    const { userId } = await requireAuth(request);

    const currentUserId = userId;

    const challengeHash = hashDisableChallenge(challenge);

    const disableChallenge = await DisableChallenge.findOne({
      challengeHash,
    });

    if (!disableChallenge) {
      throw new AppError(
        ERROR_CODES.INVALID_DISABLE_CHALLENGE,
        ERROR_MESSAGES.INVALID_DISABLE_CHALLENGE,
        401
      );
    }

    if (disableChallenge.usedAt) {
      throw new AppError(
        ERROR_CODES.DISABLE_CHALLENGE_USED,
        ERROR_MESSAGES.DISABLE_CHALLENGE_USED,
        401
      );
    }

    if (disableChallenge.expiresAt < new Date()) {
      throw new AppError(
        ERROR_CODES.DISABLE_CHALLENGE_EXPIRED,
        ERROR_MESSAGES.DISABLE_CHALLENGE_EXPIRED,
        401
      );
    }

    if (
      disableChallenge.userId.toString() !==
      currentUserId.toString()
    ) {
      throw new AppError(
        ERROR_CODES.INVALID_DISABLE_CHALLENGE,
        ERROR_MESSAGES.INVALID_DISABLE_CHALLENGE,
        401
      );
    }

    const user = await User.findById(currentUserId);

    if (!user) {
      throw new AppError(
        ERROR_CODES.USER_NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND,
        404
      );
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new AppError(
        ERROR_CODES.TWO_FACTOR_NOT_ENABLED,
        ERROR_MESSAGES.TWO_FACTOR_NOT_ENABLED,
        400
      );
    }

    if (otp) {
      const result = await verify({
        secret: user.twoFactorSecret,
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
    }

    if (backupCode) {
      const backupCodeConsumed = await consumeBackupCode(
        currentUserId.toString(),
        backupCode
      );

      if (!backupCodeConsumed) {
        throw new AppError(
          ERROR_CODES.INVALID_BACKUP_CODE,
          ERROR_MESSAGES.INVALID_BACKUP_CODE,
          401
        );
      }
    }

    disableChallenge.usedAt = new Date();
    await disableChallenge.save();

    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.TWO_FACTOR_DISABLED,
        code: SUCCESS_CODES.TWO_FACTOR_DISABLED,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log(
      "Verify-Disable Error:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}