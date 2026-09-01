import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export function proxy(request : NextRequest){
    const path = request.nextUrl.pathname;

    const isPublicPath = path==="/login" || path==="/signup" || path==="/verify-email" || path ==="/verify-email-sent"

    const token = request.cookies.get("token")?.value

if (isPublicPath && token) {
  try {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

    if (decodedToken) {
      return NextResponse.redirect(
        new URL("/profile", request.nextUrl)
      );
    }
  } catch (error) {
    const response =NextResponse.next()
     response.cookies.delete('token')
      return response
  }
}

    if(!isPublicPath && !token){
     
        return NextResponse.redirect(new URL('/login' , request.nextUrl))
    }

    if(!isPublicPath && token){
        try {
                const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );
        
     return NextResponse.next()
        } catch (error) {
    const response = NextResponse.redirect(
      new URL("/login", request.nextUrl)
    );

    response.cookies.delete("token");

    return response;

        }
    }
    return NextResponse.next(); 
}

export const config={
matcher: [
  "/",
  "/login",
  "/signup",
  "/profile",
  "/verify-email",
  "/verify-email-sent",
  "/change-password"
]
}