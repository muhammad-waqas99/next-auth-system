import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicPath =
    path === "/login" ||
    path === "/signup" ||
    path === "/verify-email" ||
    path === "/verify-email-sent" ||
    path === "/forget-password" ||
    path === "/reset-password";

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;


  if (isPublicPath && accessToken && refreshToken) {
    return NextResponse.redirect(
      new URL("/profile", request.nextUrl)
    );
  }


  if (!isPublicPath && (!accessToken || !refreshToken)) {
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
    "/verify-email",
    "/verify-email-sent",
    "/change-password",
    "/forget-password",
    "/reset-password",
  ],
};