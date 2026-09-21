import connectToDB from "@/app/dbconfig/db";
import User from "@/app/models/user.model";
import { resetPasswordStatusSchema } from "@/app/lib/validationSchema/auth.schema";
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import {
  ERROR_CODES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} from "@/app/lib/errors/messages";
import { AppError } from "@/app/lib/errors/AppError";

export async function GET(request: NextRequest) {
  try {
    const resetRequestId =
      request.nextUrl.searchParams.get("resetRequestId");

    const { resetRequestId: validResetRequestId } =
      validateRequest(
        resetPasswordStatusSchema,
        { resetRequestId }
      );

    await connectToDB();

    const user = await User.findOne({
      resetRequestId: validResetRequestId,
    });

    if (!user) {
      throw new AppError(
        ERROR_CODES.INVALID_RESET_REQUEST,
        ERROR_MESSAGES.INVALID_RESET_REQUEST,
        404
      );
    }

    const isReset = !!user.passwordResetAt;

    return NextResponse.json(
      {
        success: true,
        isReset,
        message: isReset
          ? SUCCESS_MESSAGES.PASSWORD_RESET
          : SUCCESS_MESSAGES.PASSWORD_RESET_PENDING,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.log(
      "Reset status error:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}