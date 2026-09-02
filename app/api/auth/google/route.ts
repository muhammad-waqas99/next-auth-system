import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto"

export async function GET(){
    try {

        const googleURL = new URL('https://accounts.google.com/o/oauth2/v2/auth')
        const state = crypto.randomBytes(32).toString("hex")

        googleURL.searchParams.set(
            "client_id",
            process.env.GOOGLE_CLIENT_ID!
        )
        
        googleURL.searchParams.set(
            "redirect_uri",
            process.env.GOOGLE_REDIRECT_URI!
        )
        
        googleURL.searchParams.set(
            "response_type",
            "code"
        )
        
        googleURL.searchParams.set(
            "scope",
            "openid profile email"
        )
        
        googleURL.searchParams.set(
            "state",
             state
        )

        const response = NextResponse.redirect(googleURL)

      response.cookies.set("google-auth-state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/"
})

        return response
        
    } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}