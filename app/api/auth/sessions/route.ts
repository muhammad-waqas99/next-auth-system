import connectToDB from "@/app/dbconfig/db";
import { validateRefreshToken } from "@/app/lib/auth/refreshToken/refreshToken";
import requireAuth from "@/app/lib/auth/requireAuth";
import { hashRefreshToken, verifyAccessToken } from "@/app/lib/auth/token/token";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { UnauthorizedError } from "@/app/lib/errors/UnauthorizedError";
import RefreshToken from "@/app/models/refreshToken.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
     const {userId} =await requireAuth(request)
     const {session} =await validateRefreshToken(request)

     if (session.userId.toString() !== userId) {
  throw new UnauthorizedError();
}
       const currentSession = session
    const sessions = await RefreshToken.find({
      userId,
      revokedAt: null,
    }).select("sessionId createdAt updatedAt lastUsedAt os browser device email");

    return NextResponse.json(
      {
        success: true,
        sessions,
        currentSessionId: currentSession.sessionId,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.log("Error in Sessions:", error.message);

    return errorHandler(error)
  }
}
