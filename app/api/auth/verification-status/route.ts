import connectToDB from "@/app/dbconfig/db";
import User from "@/app/models/user.model";
import { verificationStatusSchema } from "@/app/lib/validationSchema/auth.schema";
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

    const { email } = validateRequest(
      verificationStatusSchema,
      body
    );

    await connectToDB();

    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError(
        ERROR_CODES.USER_NOT_FOUND,
        ERROR_MESSAGES.USER_NOT_FOUND,
        404
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        {
          success: true,
          isVerified: true,
          message: SUCCESS_MESSAGES.VERIFICATION_STATUS_FETCHED,
          code: SUCCESS_CODES.VERIFICATION_STATUS_FETCHED,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        isVerified: false,
        message: SUCCESS_MESSAGES.VERIFICATION_STATUS_FETCHED,
        code: SUCCESS_CODES.VERIFICATION_STATUS_FETCHED,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log(
      "Verification status error:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}