import User from "@/app/models/user.model";

import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import connectToDB from "@/app/dbconfig/db";
import { resetPasswordSchema } from "@/app/lib/validationSchema/auth.schema";
import { hashPassword } from "@/app/lib/auth/password/password";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_CODES,
  SUCCESS_MESSAGES,
} from "@/app/lib/errors/messages";
import { AppError } from "@/app/lib/errors/AppError";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { plainToken,  password } =
      validateRequest(resetPasswordSchema, body);

    const hashToken = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");

    await connectToDB();

    const user = await User.findOne({
      resetPasswordToken: hashToken,
    });

    if (!user) {
      throw new AppError(
        ERROR_CODES.INVALID_RESET_TOKEN,
        ERROR_MESSAGES.INVALID_RESET_TOKEN,
        401
      );
    }

    if (
      !user.resetPasswordTokenExpiry ||
      user.resetPasswordTokenExpiry.getTime() < Date.now()
    ) {
      throw new AppError(
        ERROR_CODES.RESET_TOKEN_EXPIRED,
        ERROR_MESSAGES.RESET_TOKEN_EXPIRED,
        400
      );
    }

    const hashedPassword = await hashPassword(password);

    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiry = undefined;
    user.passwordResetAt = new Date();

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_RESET,
        code: SUCCESS_CODES.PASSWORD_RESET,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log(
      "Reset password error:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}