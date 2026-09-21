import { comparePassword } from "@/app/lib/auth/password/password";
import requireAuth from "@/app/lib/auth/requireAuth";
import {
  generateRegenerateChallenge,
  hashRegenerateChallenge,
} from "@/app/lib/auth/token/token";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { regeneratePasswordSchema } from "@/app/lib/validationSchema/auth.schema";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import RegenerateChallenge from "@/app/models/backupCodeRegenerateChallenge.model";

import { NextRequest, NextResponse } from "next/server";

import { InvalidPasswordError } from "@/app/lib/errors/InvalidPasswordError";
import { AppError } from "@/app/lib/errors/AppError";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_CODES,
  SUCCESS_MESSAGES,
} from "@/app/lib/errors/messages";

export async function POST(request: NextRequest) {
  try {
    const { user, userId } = await requireAuth(request, {
      includePassword: true,
    });

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new AppError(
        ERROR_CODES.TWO_FACTOR_NOT_ENABLED,
        ERROR_MESSAGES.TWO_FACTOR_NOT_ENABLED,
        400
      );
    }

    const body = await request.json();

    const { password } = validateRequest(
      regeneratePasswordSchema,
      body
    );

    if (!user.password) {
      throw new AppError(
        ERROR_CODES.PASSWORD_REQUIRED_FOR_BACKUP_CODE_REGENERATION,
        ERROR_MESSAGES.PASSWORD_REQUIRED_FOR_BACKUP_CODE_REGENERATION,
        400
      );
    }

    const isPasswordCorrect = await comparePassword(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      throw new InvalidPasswordError();
    }

    const challenge = generateRegenerateChallenge();
    const hashChallenge = hashRegenerateChallenge(challenge);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await RegenerateChallenge.create({
      userId,
      challengeHash: hashChallenge,
      expiresAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.REGENERATE_CHALLENGE_CREATED,
        code: SUCCESS_CODES.REGENERATE_CHALLENGE_CREATED,
        challenge,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log(
      "Regenerate Password error:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}