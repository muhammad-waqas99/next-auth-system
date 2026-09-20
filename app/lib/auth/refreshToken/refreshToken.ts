import { NextRequest } from "next/server";
import connectToDB from "@/app/dbconfig/db";
import RefreshToken from "@/app/models/refreshToken.model";
import { hashRefreshToken } from "@/app/lib/auth/token/token";
import { UnauthorizedError } from "@/app/lib/errors/UnauthorizedError";

export async function validateRefreshToken(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    throw new UnauthorizedError();
  }

  const tokenHash = hashRefreshToken(refreshToken);

  await connectToDB();

  const session = await RefreshToken.findOne({
    tokenHash,
    revokedAt: null,
  });

  if (!session) {
    throw new UnauthorizedError();
  }

  if (session.expiresAt < new Date()) {
    throw new UnauthorizedError();
  }

  if (session.sessionExpiresAt < new Date()) {
    throw new UnauthorizedError();
  }

  return {
    session,
  };
}