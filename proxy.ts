import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicPath =
    path === "/login" ||
    path === "/signup" ||
    path === "/verify-email" ||
    path === "/verify-email-sent" ||
    path === "/forget-password" ||
    path === "/reset-password" ||
    path === "/two-factor/login" ||
    path === "/two-factor/backup-login";

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;


  if (isPublicPath && accessToken && refreshToken) {
    return NextResponse.redirect(
      new URL("/profile", request.nextUrl)
    );
  }

  if (!isPublicPath && !accessToken && !refreshToken) {
    return NextResponse.redirect(
      new URL("/login", request.nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/profile",
    "/change-password",
    "/set-password",
    "/verify-email",
    "/verify-email-sent",
    "/forget-password",
    "/reset-password",

    "/two-factor/setup",
    "/two-factor/disable",
    "/two-factor/verify-disable",
    "/two-factor/backup-disable",
    "/two-factor/regenerate-password",
    "/two-factor/verify-regenerate",

    "/two-factor/login",
    "/two-factor/backup-login",
  ],
};