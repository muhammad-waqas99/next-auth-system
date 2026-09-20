import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";


import { completeLogin } from "@/app/lib/auth/login/completeLogin";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: "Authorization code missing",
        },
        { status: 400 }
      );
    }

    const googleState = request.nextUrl.searchParams.get("state");

    const saveState = request.cookies.get("google-auth-state")?.value;

    if (googleState !== saveState) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid State",
        },
        { status: 401 }
      );
    }

    const tokenResponse = await fetch(
      "https://oauth2.googleapis.com/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
          grant_type: "authorization_code",
        }),
      }
    );

    if (!tokenResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to exchange authorization code",
        },
        { status: 401 }
      );
    }

    const tokenData = await tokenResponse.json();

    const userResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!userResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to get Google user information",
        },
        { status: 401 }
      );
    }

    const googleUser = await userResponse.json();

    const email = googleUser.email;
    const name = googleUser.name;
    const isVerified = googleUser.email_verified;
    const googleID = googleUser.sub;

    if (!email || !name || isVerified !== true || !googleID) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Google user information",
        },
        { status: 400 }
      );
    }




    let user = await User.findOne({
      googleId: googleID,
    });

    if (user) {
      user.isVerified = true;

      if (user.password !== null) {
        user.authProvider = "both";
      } else {
        user.authProvider = "google";
      }

      await user.save();

      return completeLogin({
        user,
        request,
        message: "google-login",
      });
    }



    user = await User.findOne({
      email,
    });

    if (user) {
      user.authProvider = "both";
      user.googleId = googleID;

      await user.save();

      return completeLogin({
        user,
        request,
        message: "google-linked",
      });
    }

 

    user = await User.create({
      email,
      name,
      googleId: googleID,
      authProvider: "google",
      password: null,
      isVerified: true,
    });

    return completeLogin({
      user,
      request,
      message: "local-g-login",
    });
  } catch (error: any) {
    console.error("OAuth Handler Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}