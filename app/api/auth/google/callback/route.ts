import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";

import { completeLogin } from "@/app/lib/auth/login/completeLogin";
import { AppError } from "@/app/lib/errors/AppError";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
} from "@/app/lib/errors/messages";
import { errorHandler } from "@/app/lib/errors/errorHandler";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");

    if (!code) {
      throw new AppError(
        ERROR_CODES.GOOGLE_AUTH_CODE_MISSING,
        ERROR_MESSAGES.GOOGLE_AUTH_CODE_MISSING,
        400
      );
    }

    const googleState = request.nextUrl.searchParams.get("state");

    const saveState = request.cookies.get("google-auth-state")?.value;

    if (googleState !== saveState) {
      throw new AppError(
        ERROR_CODES.INVALID_GOOGLE_STATE,
        ERROR_MESSAGES.INVALID_GOOGLE_STATE,
        401
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
      throw new AppError(
        ERROR_CODES.GOOGLE_TOKEN_EXCHANGE_FAILED,
        ERROR_MESSAGES.GOOGLE_TOKEN_EXCHANGE_FAILED,
        401
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
      throw new AppError(
        ERROR_CODES.GOOGLE_USER_INFO_FAILED,
        ERROR_MESSAGES.GOOGLE_USER_INFO_FAILED,
        401
      );
    }

    const googleUser = await userResponse.json();

    const email = googleUser.email;
    const name = googleUser.name;
    const isVerified = googleUser.email_verified;
    const googleID = googleUser.sub;

    if (!email || !name || isVerified !== true || !googleID) {
      throw new AppError(
        ERROR_CODES.INVALID_GOOGLE_USER_INFO,
        ERROR_MESSAGES.INVALID_GOOGLE_USER_INFO,
        400
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
  } catch (error: unknown) {
    console.error("OAuth Handler Error:", error);

    return errorHandler(error);
  }
}