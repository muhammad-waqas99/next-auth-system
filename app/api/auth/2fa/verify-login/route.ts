import { NextRequest, NextResponse } from "next/server";
import { verify } from "otplib";

import User from "@/app/models/user.model";
import LoginChallenge from "@/app/models/loginChallenge.model";

import  connectToDB  from "@/app/dbconfig/db";
import { hashLoginChallenge } from "@/app/lib/auth/token/token";
import { getDeviceInfo } from "@/app/lib/auth/device/getDeviceInfo";
import { createLoginSession } from "@/app/lib/auth/login/createLoginSession";
import { setAuthCookies } from "@/app/lib/auth/cookies/cookies";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import { verifyOtpSchema } from "@/app/lib/validationSchema/auth.schema";

import { AppError } from "@/app/lib/errors/AppError";
import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_CODES, SUCCESS_MESSAGES } from "@/app/lib/errors/messages";
import { errorHandler } from "@/app/lib/errors/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { challenge, otp } = validateRequest(
      verifyOtpSchema,
      body
    );

    await connectToDB();

    const challengeHash = hashLoginChallenge(challenge);

    const loginChallenge = await LoginChallenge.findOne({
      challengeHash,
    });

    if (!loginChallenge) {
      throw new AppError(
        ERROR_CODES.INVALID_LOGIN_CHALLENGE,
        ERROR_MESSAGES.INVALID_LOGIN_CHALLENGE,
        401
      );
    }

    if (loginChallenge.usedAt) {
      throw new AppError(
        ERROR_CODES.LOGIN_CHALLENGE_USED,
        ERROR_MESSAGES.LOGIN_CHALLENGE_USED,
        401
      );
    }

    if (loginChallenge.expiresAt < new Date()) {
      throw new AppError(
        ERROR_CODES.LOGIN_CHALLENGE_EXPIRED,
        ERROR_MESSAGES.LOGIN_CHALLENGE_EXPIRED,
        401
      );
    }

    const user = await User.findById(loginChallenge.userId);

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

    const isValidOtp = await verify({
      token: otp,
      secret: user.twoFactorSecret,
    });

    if (!isValidOtp.valid) {
      throw new AppError(
        ERROR_CODES.INVALID_OTP,
        ERROR_MESSAGES.INVALID_OTP,
        401
      );
    }

    const challengeResult = await LoginChallenge.updateOne(
      {
        _id: loginChallenge._id,
        usedAt: null,
      },
      {
        $set: {
          usedAt: new Date(),
        },
      }
    );

    if (challengeResult.modifiedCount === 0) {
      throw new AppError(
        ERROR_CODES.LOGIN_CHALLENGE_USED,
        ERROR_MESSAGES.LOGIN_CHALLENGE_USED,
        401
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
  } catch (error) {
    return errorHandler(error);
  }
}