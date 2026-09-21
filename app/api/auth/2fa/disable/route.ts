import { comparePassword } from "@/app/lib/auth/password/password";
import requireAuth from "@/app/lib/auth/requireAuth";
import {
  generateDisableChallenge,
  hashDisableChallenge,
} from "@/app/lib/auth/token/token";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { disableTwoFactorSchema } from "@/app/lib/validationSchema/auth.schema";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";

import DisableChallenge from "@/app/models/twoFactorDisableChallenge.model";

import { NextRequest, NextResponse } from "next/server";

import { AppError } from "@/app/lib/errors/AppError";
import { InvalidPasswordError } from "@/app/lib/errors/InvalidPasswordError";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_CODES,
  SUCCESS_MESSAGES,
} from "@/app/lib/errors/messages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { password } = validateRequest(
      disableTwoFactorSchema,
      body
    );

    const { user } = await requireAuth(request, {
      includePassword: true,
    });

    if (!user.password) {
      throw new AppError(
        ERROR_CODES.PASSWORD_REQUIRED_FOR_2FA_DISABLE,
        ERROR_MESSAGES.PASSWORD_REQUIRED_FOR_2FA_DISABLE,
        400
      );
    }

    if (!user.twoFactorEnabled) {
      throw new AppError(
        ERROR_CODES.TWO_FACTOR_ALREADY_DISABLED,
        ERROR_MESSAGES.TWO_FACTOR_ALREADY_DISABLED,
        400
      );
    }

    const checkPassword = await comparePassword(
      password,
      user.password
    );

    if (!checkPassword) {
      throw new InvalidPasswordError();
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const disableChallenge = generateDisableChallenge();
    const challengeHash = hashDisableChallenge(disableChallenge);

    await DisableChallenge.create({
      userId: user.id,
      challengeHash,
      expiresAt,
    });

    return NextResponse.json(
      {
        success: true,
        passwordCheck: true,
        challenge: disableChallenge,
        message: SUCCESS_MESSAGES.DISABLE_CHALLENGE_CREATED,
        code: SUCCESS_CODES.DISABLE_CHALLENGE_CREATED,
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