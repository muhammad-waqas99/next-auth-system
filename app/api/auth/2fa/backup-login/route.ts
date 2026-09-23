import { NextRequest, NextResponse } from "next/server";

import LoginChallenge from "@/app/models/loginChallenge.model";

import  connectToDB  from "@/app/dbconfig/db";
import { hashLoginChallenge } from "@/app/lib/auth/token/token";
import  {consumeBackupCode}  from "@/app/lib/auth/backup-code/consumeBackupCode";
import { getDeviceInfo } from "@/app/lib/auth/device/getDeviceInfo";
import { createLoginSession } from "@/app/lib/auth/login/createLoginSession";
import { setAuthCookies } from "@/app/lib/auth/cookies/cookies";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import { backupLoginSchema } from "@/app/lib/validationSchema/auth.schema";

import { AppError } from "@/app/lib/errors/AppError";
import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_CODES, SUCCESS_MESSAGES } from "@/app/lib/errors/messages";
import { errorHandler } from "@/app/lib/errors/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { challenge, backupCode } = validateRequest(
      backupLoginSchema,
      body
    );

    await connectToDB();

    const challengeHash = hashLoginChallenge(challenge);

    const loginChallenge = await LoginChallenge.findOne({
      challengeHash,
    });

    if (!loginChallenge) {
      throw new AppError(
        ERROR_CODES.INVALID_LOGIN_CHALLENGE,
        ERROR_MESSAGES.INVALID_LOGIN_CHALLENGE,
        401
      );
    }

    if (loginChallenge.usedAt) {
      throw new AppError(
        ERROR_CODES.LOGIN_CHALLENGE_USED,
        ERROR_MESSAGES.LOGIN_CHALLENGE_USED,
        401
      );
    }

    if (loginChallenge.expiresAt < new Date()) {
      throw new AppError(
        ERROR_CODES.LOGIN_CHALLENGE_EXPIRED,
        ERROR_MESSAGES.LOGIN_CHALLENGE_EXPIRED,
        401
      );
    }

    const userId = loginChallenge.userId.toString();

   const isValidBackupCode = await consumeBackupCode(
  userId,
  backupCode
);

if (!isValidBackupCode) {
  throw new AppError(
    ERROR_CODES.INVALID_BACKUP_CODE,
    ERROR_MESSAGES.INVALID_BACKUP_CODE,
    401
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
      throw new AppError(
        ERROR_CODES.LOGIN_CHALLENGE_USED,
        ERROR_MESSAGES.LOGIN_CHALLENGE_USED,
        401
      );
    }

    const { browser, os, device } = getDeviceInfo(request);

    const { accessToken, refreshToken } = await createLoginSession({
      userId,
      browser,
      os,
      device,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        code: SUCCESS_CODES.LOGIN_SUCCESS,
      },
      { status: 200 }
    );

    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    return errorHandler(error);
  }
}