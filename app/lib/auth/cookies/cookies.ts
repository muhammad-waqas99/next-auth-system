import { NextResponse } from "next/server";

const ACCESS_TOKEN_MAX_AGE = 60 * 15;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
) {
  response.cookies.set({
    name: "accessToken",
    value: accessToken,
    httpOnly: true,
    sameSite: "lax",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  response.cookies.set({
    name: "refreshToken",
    value: refreshToken,
    httpOnly: true,
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete("accessToken");
  response.cookies.delete("refreshToken");
}