import { validateRefreshToken } from "@/app/lib/auth/refreshToken/refreshToken";
import requireAuth from "@/app/lib/auth/requireAuth";

import { errorHandler } from "@/app/lib/errors/errorHandler";
import { UnauthorizedError } from "@/app/lib/errors/UnauthorizedError";
import {
  SUCCESS_CODES,
  SUCCESS_MESSAGES,
} from "@/app/lib/errors/messages";
import RefreshToken from "@/app/models/refreshToken.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request);
    const { session } = await validateRefreshToken(request);

    if (session.userId.toString() !== userId) {
      throw new UnauthorizedError();
    }

    const currentSession = session;

    const sessions = await RefreshToken.find({
      userId,
      revokedAt: null,
    }).select(
      "sessionId createdAt updatedAt lastUsedAt os browser device email"
    );

    return NextResponse.json(
      {
        success: true,
        sessions,
        currentSessionId: currentSession.sessionId,
        message: SUCCESS_MESSAGES.CURRENT_SESSIONS_FETCHED,
        code: SUCCESS_CODES.CURRENT_SESSIONS_FETCHED,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log(
      "Error in Sessions:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}