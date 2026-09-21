import { clearAuthCookies } from "@/app/lib/auth/cookies/cookies";
import { validateRefreshToken } from "@/app/lib/auth/refreshToken/refreshToken";
import requireAuth from "@/app/lib/auth/requireAuth";

import { errorHandler } from "@/app/lib/errors/errorHandler";
import { UnauthorizedError } from "@/app/lib/errors/UnauthorizedError";
import {
  SUCCESS_CODES,
  SUCCESS_MESSAGES,
} from "@/app/lib/errors/messages";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request);
    const { session } = await validateRefreshToken(request);

    if (session.userId.toString() !== userId) {
      throw new UnauthorizedError();
    }

    session.revokedAt = new Date();

    await session.save();

    const response = NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
        code: SUCCESS_CODES.LOGOUT_SUCCESS,
      },
      { status: 200 }
    );

    clearAuthCookies(response);

    return response;
  } catch (error: unknown) {
    console.log(
      "Error in Logout:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}