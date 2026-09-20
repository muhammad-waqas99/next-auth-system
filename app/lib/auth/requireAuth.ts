import { NextRequest } from "next/server";
import User from "@/app/models/user.model";
import { verifyAccessToken } from "./token/token";
import { UnauthorizedError } from "@/app/lib/errors/UnauthorizedError";

interface RequireAuthOptions {
  includePassword?: boolean;
}

export default async function requireAuth(
  request: NextRequest,
  options: RequireAuthOptions = {}
) {
  const { includePassword = false } = options;

  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    throw new UnauthorizedError();
  }

  const payload = verifyAccessToken(accessToken);

  if (!payload?.id) {
    throw new UnauthorizedError();
  }

  const user = await User.findById(payload.id).select(
    includePassword ? "+password" : "-password"
  );

  if (!user) {
    throw new UnauthorizedError();
  }

  return {
    user,
    userId: payload.id,
  };
}