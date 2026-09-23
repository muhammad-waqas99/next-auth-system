import { NextRequest, NextResponse } from "next/server";

import BackupCode from "@/app/models/backupCode.model";
import requireAuth from "@/app/lib/auth/requireAuth";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_CODES,
  SUCCESS_MESSAGES,
} from "@/app/lib/errors/messages";
import { AppError } from "@/app/lib/errors/AppError";


export async function GET(request: NextRequest) {
  try {
    const { userId, user } = await requireAuth(request);

    const currentUser = user;

    if (!currentUser) {
      throw new AppError(
        ERROR_CODES.USER_NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND,
        404
      );
    }

    let backupCodesRemaining = 0;

    if (currentUser.twoFactorEnabled) {
      const backupCodes = await BackupCode.findOne({ userId });

      if (!backupCodes) {
        backupCodesRemaining = 0;
      } else {
        backupCodesRemaining = backupCodes?.codes.filter((code) => {
          return code.usedAt === null;
        }).length;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.CURRENT_USER_DETAILS_FETCHED,
        code: SUCCESS_CODES.CURRENT_USER_DETAILS_FETCHED,
        user: currentUser,
        backupCodesRemaining,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log(
      "Something went wrong:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}