import { NextRequest, NextResponse } from "next/server";
import User from "@/app/models/user.model";

import { createLoginChallenge } from "./createLoginChallenge";
import { createLoginSession } from "./createLoginSession";
import { getDeviceInfo } from "../device/getDeviceInfo";

interface CompleteLoginParams {
  user: typeof User.prototype;
  request: NextRequest;
  message: string;
}

export async function completeLogin({
  user,
  request,
  message,
}: CompleteLoginParams) {
  const { browser, os, device } = getDeviceInfo(request);

  if (user.twoFactorEnabled) {
    const challenge = await createLoginChallenge(user.id);

    return NextResponse.redirect(
      new URL(
        `/two-factor/login?challenge=${challenge}&message=${message}`,
        request.url
      )
    );
  }

  const { accessToken, refreshToken } = await createLoginSession({
    userId: user.id,
    browser,
    os,
    device,
  });

  const response = NextResponse.redirect(
    new URL(`/profile?message=${message}`, request.url)
  );

  response.cookies.set({
    name: "accessToken",
    value: accessToken,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 15,
  });

  response.cookies.set({
    name: "refreshToken",
    value: refreshToken,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}