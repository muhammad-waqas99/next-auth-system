import { NextRequest, NextResponse } from "next/server";

import { hashLoginChallenge } from "@/app/lib/auth/token/token";
import { consumeBackupCode } from "@/app/lib/auth/backup-code/consumeBackupCode";
import { getDeviceInfo } from "@/app/lib/auth/device/getDeviceInfo";
import { createLoginSession } from "@/app/lib/auth/login/createLoginSession";

import LoginChallenge from "@/app/models/loginChallenge.model";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();

    const { challenge, backupCode } = reqBody;

    if (!challenge || !backupCode) {
      return NextResponse.json(
        {
          success: false,
          message: "challenge and backup code required",
        },
        { status: 400 }
      );
    }


    const challengeHash = hashLoginChallenge(challenge);

    const loginChallenge = await LoginChallenge.findOne({
      challengeHash,
    });

    if (!loginChallenge) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login challenge",
        },
        { status: 401 }
      );
    }

    if (loginChallenge.usedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Login challenge has already been used",
        },
        { status: 401 }
      );
    }

    if (loginChallenge.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Login challenge has expired",
        },
        { status: 401 }
      );
    }

    const userId = loginChallenge.userId.toString();


    const backupCodeConsumed = await consumeBackupCode(
      userId,
      backupCode
    );

    if (!backupCodeConsumed) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect or expired backup code",
        },
        { status: 401 }
      );
    }



    const challengeResult = await LoginChallenge.updateOne(
      {
        _id: loginChallenge._id,
        usedAt: null,
      },
      {
        $set: {
          usedAt: new Date(),
        },
      }
    );

    if (challengeResult.modifiedCount === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Login challenge has already been used",
        },
        { status: 401 }
      );
    }



    const { browser, os, device } = getDeviceInfo(request);

    const { accessToken, refreshToken } =
      await createLoginSession({
        userId,
        browser,
        os,
        device,
      });


    const response = NextResponse.json(
      {
        success: true,
        message: "Logged in successfully",
      },
      { status: 200 }
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
  } catch (error: any) {
    console.log("Backup Code Login error:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}