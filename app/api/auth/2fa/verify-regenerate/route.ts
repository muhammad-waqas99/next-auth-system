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
    const { user, userId } = await requireAuth(request);

    const body = await request.json();

    const { challenge, otp } = validateRequest(
      verifyOtpSchema,
      body
    );

    const challengeHash = hashRegenerateChallenge(challenge);

    const regenerateChallenge = await RegenerateChallenge.findOne({
      challengeHash,
    });

    if (!regenerateChallenge) {
      throw new AppError(
        ERROR_CODES.INVALID_REGENERATE_CHALLENGE,
        ERROR_MESSAGES.INVALID_REGENERATE_CHALLENGE,
        401
      );
    }

    if (regenerateChallenge.usedAt) {
      throw new AppError(
        ERROR_CODES.REGENERATE_CHALLENGE_USED,
        ERROR_MESSAGES.REGENERATE_CHALLENGE_USED,
        401
      );
    }

    if (regenerateChallenge.expiresAt < new Date()) {
      throw new AppError(
        ERROR_CODES.REGENERATE_CHALLENGE_EXPIRED,
        ERROR_MESSAGES.REGENERATE_CHALLENGE_EXPIRED,
        401
      );
    }

    if (regenerateChallenge.userId.toString() !== userId) {
      throw new AppError(
        ERROR_CODES.INVALID_REGENERATE_CHALLENGE,
        ERROR_MESSAGES.INVALID_REGENERATE_CHALLENGE,
        401
      );
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new AppError(
        ERROR_CODES.TWO_FACTOR_NOT_ENABLED,
        ERROR_MESSAGES.TWO_FACTOR_NOT_ENABLED,
        400
      );
    }

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

    const backupCode = await BackupCode.findOne({
      userId,
    });

    if (!backupCode) {
      throw new AppError(
        ERROR_CODES.BACKUP_CODES_NOT_FOUND,
        ERROR_MESSAGES.BACKUP_CODES_NOT_FOUND,
        404
      );
    }

    if (backupCode.lastRegeneratedAt) {
      const cooldown = 30 * 24 * 60 * 60 * 1000;

      const nextAllowedAt =
        backupCode.lastRegeneratedAt.getTime() + cooldown;

      if (Date.now() < nextAllowedAt) {
        throw new AppError(
          ERROR_CODES.BACKUP_CODE_REGENERATION_COOLDOWN,
          ERROR_MESSAGES.BACKUP_CODE_REGENERATION_COOLDOWN,
          429
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
        message: SUCCESS_MESSAGES.BACKUP_CODES_REGENERATED,
        code: SUCCESS_CODES.BACKUP_CODES_REGENERATED,
        backupCodes: codes,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log(
      "Verify Regenerate Backup Codes Error:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}