import requireAuth from "@/app/lib/auth/requireAuth";

import { AppError } from "@/app/lib/errors/AppError";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_CODES,
  SUCCESS_MESSAGES,
} from "@/app/lib/errors/messages";
import RefreshToken from "@/app/models/refreshToken.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const sessionId = reqBody.sessionId;

    if (!sessionId) {
      throw new AppError(
        ERROR_CODES.VALIDATION_ERROR,
        ERROR_MESSAGES.VALIDATION_ERROR,
        400
      );
    }

    const { userId } = await requireAuth(request);

    const session = await RefreshToken.updateOne(
      { userId, sessionId, revokedAt: null },
      { revokedAt: new Date() }
    );

    if (session.matchedCount === 0) {
      throw new AppError(
        ERROR_CODES.INVALID_SESSION,
        ERROR_MESSAGES.INVALID_SESSION,
        404
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.SESSION_LOGOUT_SUCCESS,
        code: SUCCESS_CODES.SESSION_LOGOUT_SUCCESS,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log(
      "Error in Logout Session:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}