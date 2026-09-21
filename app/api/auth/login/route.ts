import { NextRequest, NextResponse } from "next/server";

import User from "@/app/models/user.model";

import connectToDB from "@/app/dbconfig/db";
import { loginSchema } from "@/app/lib/validationSchema/auth.schema";

import { createLoginChallenge } from "@/app/lib/auth/login/createLoginChallenge";
import { createLoginSession } from "@/app/lib/auth/login/createLoginSession";
import { getDeviceInfo } from "@/app/lib/auth/device/getDeviceInfo";
import { setAuthCookies } from "@/app/lib/auth/cookies/cookies";
import { comparePassword } from "@/app/lib/auth/password/password";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import { errorHandler } from "@/app/lib/errors/errorHandler";

import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_CODES, SUCCESS_MESSAGES } from "@/app/lib/errors/messages";
import { AppError } from "@/app/lib/errors/AppError";

export async function POST(request: NextRequest) {
  try {
    const body= await request.json();

    const { email, password } = validateRequest(
      loginSchema,
      body
    );

    await connectToDB();

    const user = await User.findOne({ email });

    if (user && user.authProvider === "google") {
      throw new AppError(
        ERROR_CODES.PASSWORD_LOGIN_UNAVAILABLE,
        ERROR_MESSAGES.PASSWORD_LOGIN_UNAVAILABLE,
        400
      );
    }

    if (!user) {
      throw new AppError(
        ERROR_CODES.INVALID_CREDENTIALS,
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        401
      );
    }

    if (!user.password) {
      throw new AppError(
        ERROR_CODES.PASSWORD_LOGIN_UNAVAILABLE,
        ERROR_MESSAGES.PASSWORD_LOGIN_UNAVAILABLE,
        400
      );
    }

    const checkPassword = await comparePassword(password, user.password);

    if (!checkPassword) {
      throw new AppError(
        ERROR_CODES.INVALID_CREDENTIALS,
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        401
      );
    }

    if (!user.isVerified) {
      throw new AppError(
        ERROR_CODES.EMAIL_NOT_VERIFIED,
        ERROR_MESSAGES.EMAIL_NOT_VERIFIED,
        403
      );
    }

    if (user.twoFactorEnabled) {
      const loginChallenge = await createLoginChallenge(user.id);

      return NextResponse.json(
        {
          success: true,
          requiresTwoFactor: true,
          challenge: loginChallenge,
          message: SUCCESS_MESSAGES.TWO_FACTOR_REQUIRED,
          code: SUCCESS_CODES.TWO_FACTOR_REQUIRED,
        },
        { status: 200 }
      );
    }

    const { browser, os, device } = getDeviceInfo(request);

    const { accessToken, refreshToken } = await createLoginSession({
      userId: user.id,
      browser,
      os,
      device,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        code: SUCCESS_CODES.LOGIN_SUCCESS,
      },
      { status: 200 }
    );

    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error: unknown) {
    console.log(
      "Login error:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}