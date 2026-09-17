import RefreshToken from "@/app/models/refreshToken.model";
import {
  createAccessToken,
  generateRefreshToken,
  generateSessionId,
  hashRefreshToken,
} from "@/app/lib/auth/token/token";

interface CreateLoginSessionParams {
  userId: string;
  browser: string;
  os: string;
  device: string;
}

export async function createLoginSession({
  userId,
  browser,
  os,
  device,
}: CreateLoginSessionParams) {
  const accessPayload = {
    id: userId,
    type: "access",
  };

  const accessToken = createAccessToken(accessPayload);

  const refreshToken = generateRefreshToken();

  const hashedRefreshToken = hashRefreshToken(refreshToken);

  const currentDate = Date.now();

  const expiryDate = new Date(currentDate + 6.048e8);

  const sessionExpiresAt = new Date(currentDate + 2.592e9);

  const sessionId = generateSessionId();

  const newRefreshToken = new RefreshToken({
    userId,
    expiresAt: expiryDate,
    sessionExpiresAt,
    tokenHash: hashedRefreshToken,
    sessionId,
    os,
    browser,
    device,
  });

  await newRefreshToken.save();

  return {
    accessToken,
    refreshToken,
  };
}