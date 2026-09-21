import connectToDB from "@/app/dbconfig/db";
import User from "@/app/models/user.model";
import { verifyEmailSchema } from "@/app/lib/validationSchema/auth.schema";
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { AppError } from "@/app/lib/errors/AppError";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_CODES,
  SUCCESS_MESSAGES,
} from "@/app/lib/errors/messages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { token } = validateRequest(
      verifyEmailSchema,
      body
    );

    await connectToDB();

    const user = await User.findOne({
      verificationToken: token,
    });

    if (!user) {
      throw new AppError(
        ERROR_CODES.INVALID_VERIFICATION_TOKEN,
        ERROR_MESSAGES.INVALID_VERIFICATION_TOKEN,
        401
      );
    }

    const isExpired =
      user.verificationTokenExpiry &&
      user.verificationTokenExpiry.getTime() < Date.now();

    if (isExpired) {
      throw new AppError(
        ERROR_CODES.VERIFICATION_TOKEN_EXPIRED,
        ERROR_MESSAGES.VERIFICATION_TOKEN_EXPIRED,
        400
      );
    }

    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    user.isVerified = true;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.EMAIL_VERIFIED,
        code: SUCCESS_CODES.EMAIL_VERIFIED,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log(
      "Email verification error:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}