import { NextRequest, NextResponse } from "next/server";
import connectToDB from "@/app/dbconfig/db";
import User from "@/app/models/user.model";
import LoginChallenge from "@/app/models/loginChallenge.model";
import RefreshToken from "@/app/models/refreshToken.model";
import {
  createAccessToken,
  generateRefreshToken,
  generateSessionId,
  hashRefreshToken,
  hashLoginChallenge,
} from "@/app/lib/auth/token/token";
import { UAParser } from "ua-parser-js";
import { verify } from "otplib";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import { verifyOtpSchema } from "@/app/lib/validationSchema/auth.schema";
import { setAuthCookies } from "@/app/lib/auth/cookies/cookies";
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

    loginChallenge.usedAt = new Date();
    await loginChallenge.save();

    const accessPayload = {
      id: user.id,
      type: "access",
    };

    const accessToken = createAccessToken(accessPayload);

    const refreshToken = generateRefreshToken();

    const hashedRefreshToken = hashRefreshToken(refreshToken);

    const currentDate = Date.now();

    const expiryDate = new Date(currentDate + 6.048e8);

    const sessionExpiresAt = new Date(currentDate + 2.592e9);

    const sessionId = generateSessionId();

    const userAgent = request.headers.get("user-agent") ?? "";

    const parser = new UAParser(userAgent);

    const browser = parser.getBrowser().name || "Unknown";
    const os = parser.getOS().name || "Unknown";

    const deviceInfo = parser.getDevice();
    const device = deviceInfo.type || "Desktop";

    const newRefreshToken = new RefreshToken({
      userId: user.id,
      expiresAt: expiryDate,
      sessionExpiresAt,
      tokenHash: hashedRefreshToken,
      sessionId,
      os,
      browser,
      device,
    });

    await newRefreshToken.save();

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
      "Verify login 2FA error:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}