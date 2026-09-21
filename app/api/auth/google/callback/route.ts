import { NextRequest, NextResponse } from "next/server";

import User from "@/app/models/user.model";

import  connectToDB  from "@/app/dbconfig/db";
import { completeLogin } from "@/app/lib/auth/login/completeLogin";

import { AppError } from "@/app/lib/errors/AppError";
import { ERROR_CODES, ERROR_MESSAGES } from "@/app/lib/errors/messages";
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

    const state = request.nextUrl.searchParams.get("state");
    const storedState = request.cookies.get("google-auth-state")?.value;

    if (!state || !storedState || state !== storedState) {
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

    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      throw new AppError(
        ERROR_CODES.GOOGLE_USER_INFO_FAILED,
        ERROR_MESSAGES.GOOGLE_USER_INFO_FAILED,
        401
      );
    }

    const googleUser = await userInfoResponse.json();

    const {
      sub: googleId,
      email,
      name,
      email_verified: emailVerified,
    } = googleUser;

    if (!googleId || !email || !name || !emailVerified) {
      throw new AppError(
        ERROR_CODES.INVALID_GOOGLE_USER_INFO,
        ERROR_MESSAGES.INVALID_GOOGLE_USER_INFO,
        400
      );
    }

    await connectToDB();

    let user = await User.findOne({ googleId });

    if (user) {
      user.isVerified = true;

      user.authProvider = user.password
        ? "both"
        : "google";

      await user.save();

      const response = await completeLogin({
        user,
        request,
        flow: "google-login",
      });

      response.cookies.delete("google-auth-state");

      return response;
    }

    user = await User.findOne({ email });

    if (user) {
      user.googleId = googleId;
      user.isVerified = true;
      user.authProvider = "both";

      await user.save();

      const response = await completeLogin({
        user,
        request,
        flow: "google-linked",
      });

      response.cookies.delete("google-auth-state");

      return response;
    }

    user = await User.create({
      name,
      email,
      googleId,
      isVerified: true,
      authProvider: "google",
    });

    const response = await completeLogin({
      user,
      request,
      flow: "local-g-login",
    });

    response.cookies.delete("google-auth-state");

    return response;
  } catch (error) {
    return errorHandler(error);
  }
}