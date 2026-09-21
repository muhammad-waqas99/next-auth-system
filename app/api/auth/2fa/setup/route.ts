import { NextRequest, NextResponse } from "next/server";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";
import requireAuth from "@/app/lib/auth/requireAuth";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { comparePassword } from "@/app/lib/auth/password/password";
import { setupTwoFactorSchema } from "@/app/lib/validationSchema/auth.schema";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";

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
    const { user } = await requireAuth(request, {
      includePassword: true,
    });

    if (user.twoFactorEnabled) {
      throw new AppError(
        ERROR_CODES.TWO_FACTOR_ALREADY_ENABLED,
        ERROR_MESSAGES.TWO_FACTOR_ALREADY_ENABLED,
        400
      );
    }

    if (user.pendingTwoFactorSecret) {
      const now = new Date();

      if (
        user.pendingTwoFactorExpiresAt &&
        user.pendingTwoFactorExpiresAt > now
      ) {
        throw new AppError(
          ERROR_CODES.TWO_FACTOR_SETUP_IN_PROGRESS,
          ERROR_MESSAGES.TWO_FACTOR_SETUP_IN_PROGRESS,
          400
        );
      }

      user.pendingTwoFactorSecret = null;
      user.pendingTwoFactorExpiresAt = null;

      await user.save();
    }

    const body = await request.json();

    const { password } = validateRequest(
      setupTwoFactorSchema,
      body
    );

    if (!user.password) {
      throw new AppError(
        ERROR_CODES.PASSWORD_REQUIRED_FOR_2FA_SETUP,
        ERROR_MESSAGES.PASSWORD_REQUIRED_FOR_2FA_SETUP,
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

    const userEmail = user.email;
    const issuer = process.env.ISSUER!;

    const secret = generateSecret();

    const pendingTwoFactorExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user.pendingTwoFactorSecret = secret;
    user.pendingTwoFactorExpiresAt = pendingTwoFactorExpiresAt;

    await user.save();

    const uri = generateURI({
      issuer,
      label: userEmail,
      secret,
    });

    const qrCode = await QRCode.toDataURL(uri);

    return NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.TWO_FACTOR_SETUP_STARTED,
        code: SUCCESS_CODES.TWO_FACTOR_SETUP_STARTED,
        qrCode,
        secret,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log(
      "2FA setup error:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}