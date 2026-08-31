import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/lib/auth";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicPath =
    path === "/login" || path === "/signup";

  const token = request.cookies.get("token")?.value;

  const decodedToken = token ? verifyToken(token) : null;

  if (isPublicPath && decodedToken) {
    return NextResponse.redirect(
      new URL("/", request.nextUrl)
    );
  }

  if (!isPublicPath && !decodedToken) {
    return NextResponse.redirect(
      new URL("/login", request.nextUrl)
    );
  }

  return NextResponse.next();
}