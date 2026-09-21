import { clearAuthCookies } from "@/app/lib/auth/cookies/cookies";
import requireAuth from "@/app/lib/auth/requireAuth";

import { errorHandler } from "@/app/lib/errors/errorHandler";
import {
  SUCCESS_CODES,
  SUCCESS_MESSAGES,
} from "@/app/lib/errors/messages";
import RefreshToken from "@/app/models/refreshToken.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth(request);

    await RefreshToken.updateMany(
      {
        userId,
        revokedAt: null,
      },
      {
        $set: { revokedAt: new Date() },
      }
    );

    const response = NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.LOGOUT_ALL_SUCCESS,
        code: SUCCESS_CODES.LOGOUT_ALL_SUCCESS,
      },
      { status: 200 }
    );

    clearAuthCookies(response);

    return response;
  } catch (error: unknown) {
    console.log(
      "Error in Logout All:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}