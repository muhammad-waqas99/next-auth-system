import connectToDB from "@/app/dbconfig/db";
import { hashRefreshToken, verifyAccessToken } from "@/app/lib/auth/token";
import RefreshToken from "@/app/models/refreshToken.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("accessToken")?.value.toString();
    const refreshToken = request.cookies.get("refreshToken")?.value.toString();

    if (!refreshToken || !accessToken) {
      return NextResponse.json(
        { success: false, message: "Auth Tokens Required " },
        { status: 401 },
      );
    }

    const hashedRefreshToken = hashRefreshToken(refreshToken);
    const accessTokenData = verifyAccessToken(accessToken);

    if (!accessTokenData) {
      return NextResponse.json(
        { success: false, message: "invalid access token " },
        { status: 401 },
      );
    }

    const userId = accessTokenData.id;
    await connectToDB();
    const currentSession = await RefreshToken.findOne({
      tokenHash: hashedRefreshToken,
      userId,
      revokedAt: null,
    });
    if (!currentSession) {
      return NextResponse.json(
        { success: false, message: "invalid Refresh  token " },
        { status: 401 },
      );
    }

    const sessions = await RefreshToken.find({
      userId,
      revokedAt: null,
    }).select("sessionId createdAt updatedAt lastUsedAt os browser device");
console.log(sessions);
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

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 },
    );
  }
}
