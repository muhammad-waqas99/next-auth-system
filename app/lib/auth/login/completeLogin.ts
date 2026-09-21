import { NextRequest, NextResponse } from "next/server";
import User from "@/app/models/user.model";

import { createLoginChallenge } from "./createLoginChallenge";
import { createLoginSession } from "./createLoginSession";
import { getDeviceInfo } from "../device/getDeviceInfo";
import { setAuthCookies } from "../cookies/cookies";

interface CompleteLoginParams {
  user: typeof User.prototype;
  request: NextRequest;
  flow: string;
}

export async function completeLogin({
  user,
  request,
  flow,
}: CompleteLoginParams) {
  const { browser, os, device } = getDeviceInfo(request);

  if (user.twoFactorEnabled) {
    const challenge = await createLoginChallenge(user.id);

    return NextResponse.redirect(
      new URL(
        `/two-factor/login?challenge=${challenge}&message=${flow}`,
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
    new URL(`/profile?message=${flow}`, request.url)
  );

  setAuthCookies(response, accessToken, refreshToken);

  return response;
}