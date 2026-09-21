import {
  clearAuthCookies,
  setAuthCookies,
} from "@/app/lib/auth/cookies/cookies";
import { validateRefreshToken } from "@/app/lib/auth/refreshToken/refreshToken";
import {
  createAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "@/app/lib/auth/token/token";

import { errorHandler } from "@/app/lib/errors/errorHandler";
import { UnauthorizedError } from "@/app/lib/errors/UnauthorizedError";
import {
  SUCCESS_CODES,
  SUCCESS_MESSAGES,
} from "@/app/lib/errors/messages";
import RefreshToken from "@/app/models/refreshToken.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { session } = await validateRefreshToken(request);

    const userId = session.userId.toString();

    const newRefreshToken = generateRefreshToken();
    const newHashedRefreshToken =
      hashRefreshToken(newRefreshToken).toString();

    const accessPayload = {
      id: userId,
      type: "access",
    };

    const newAccessToken = createAccessToken(accessPayload);

    const currentDate = new Date();
    const expiryDate = new Date(
      currentDate.getTime() + 6.048e8
    );

    session.revokedAt = currentDate;

    await session.save();

    const newRotateRefreshToken = new RefreshToken({
      expiresAt: expiryDate,
      sessionExpiresAt: session.sessionExpiresAt,
      userId: session.userId,
      tokenHash: newHashedRefreshToken,
      sessionId: session.sessionId,
      lastUsedAt: currentDate,
      os: session.os,
      browser: session.browser,
      device: session.device,
    });

    await newRotateRefreshToken.save();

    const response = NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.TOKEN_REFRESHED,
        code: SUCCESS_CODES.TOKEN_REFRESHED,
      },
      { status: 200 }
    );

    setAuthCookies(response, newAccessToken, newRefreshToken);

    return response;
  } catch (error: unknown) {
    console.log(
      "Refresh error:",
      error instanceof Error ? error.message : error
    );

    if (error instanceof UnauthorizedError) {
      const response = NextResponse.json(
        {
          success: false,
          code: error.code,
          message: error.message,
        },
        { status: 401 }
      );

      clearAuthCookies(response);

      return response;
    }

    return errorHandler(error);
  }
}