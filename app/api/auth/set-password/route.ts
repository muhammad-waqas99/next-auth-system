import { NextRequest, NextResponse } from "next/server";

import { setPasswordSchema } from "@/app/lib/validationSchema/auth.schema";

import requireAuth from "@/app/lib/auth/requireAuth";

import { errorHandler } from "@/app/lib/errors/errorHandler";
import { AppError } from "@/app/lib/errors/AppError";
import { hashPassword } from "@/app/lib/auth/password/password";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_CODES,
  SUCCESS_MESSAGES,
} from "@/app/lib/errors/messages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { newPassword } = validateRequest(
      setPasswordSchema,
      body
    );

    const { user } = await requireAuth(request, {
      includePassword: true,
    });

    if (user.authProvider !== "google") {
      throw new AppError(
        ERROR_CODES.PASSWORD_ALREADY_SET,
        ERROR_MESSAGES.PASSWORD_ALREADY_SET,
        400
      );
    }

    const hashedPassword = await hashPassword(newPassword);

    user.password = hashedPassword;
    user.authProvider = "both";

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.PASSWORD_SET,
        code: SUCCESS_CODES.PASSWORD_SET,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log(
      "Set password error:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}