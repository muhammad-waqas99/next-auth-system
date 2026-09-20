import { NextRequest, NextResponse } from "next/server";

import { hashLoginChallenge } from "@/app/lib/auth/token/token";
import { consumeBackupCode } from "@/app/lib/auth/backup-code/consumeBackupCode";
import { getDeviceInfo } from "@/app/lib/auth/device/getDeviceInfo";
import { createLoginSession } from "@/app/lib/auth/login/createLoginSession";

import LoginChallenge from "@/app/models/loginChallenge.model";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import { backupLoginSchema } from "@/app/lib/validationSchema/auth.schema";
import { setAuthCookies } from "@/app/lib/auth/cookies/cookies";
import { errorHandler } from "@/app/lib/errors/errorHandler";

export async function POST(request: NextRequest) {
  try {
const body = await request.json();

const { challenge, backupCode } = validateRequest(
  backupLoginSchema,
  body
);




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

setAuthCookies(response , accessToken , refreshToken)

    return response;
  } catch (error: any) {
    console.log("Backup Code Login error:", error.message);

   return errorHandler(error)
  }
}