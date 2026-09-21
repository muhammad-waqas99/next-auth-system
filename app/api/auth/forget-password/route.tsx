import connectToDB from "@/app/dbconfig/db";
import crypto from "node:crypto";
import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import sendMail from "@/app/lib/mail";
import { forgotPasswordSchema } from "@/app/lib/validationSchema/auth.schema";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_CODES, SUCCESS_MESSAGES } from "@/app/lib/errors/messages";
import { AppError } from "@/app/lib/errors/AppError";

export async function POST(request: NextRequest) {
  try {
const body = await request.json();

const { email } = validateRequest(
  forgotPasswordSchema,
  body
);



    await connectToDB();

    const user = await User.findOne({ email });

if (!user) {
  return NextResponse.json(
    {
      success: true,
      message: SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
      code: SUCCESS_CODES.PASSWORD_RESET_EMAIL_SENT,
    },
    { status: 200 }
  );
}
if (user.authProvider === "google") {
  throw new AppError(

    ERROR_CODES.GOOGLE_AUTH_REQUIRED,
    ERROR_MESSAGES.GOOGLE_AUTH_REQUIRED,
    400
  );
}

    const plainToken = crypto
      .randomBytes(32)
      .toString("hex");

    const hashToken = crypto
      .createHash("sha256")
      .update(plainToken)
      .digest("hex");

    const resetPasswordTokenExpiry = new Date(
      Date.now() + 15 * 60 * 1000
    );

const resetRequestId = crypto.randomUUID();
user.resetPasswordToken = hashToken;
user.resetPasswordTokenExpiry = resetPasswordTokenExpiry;
user.resetRequestId = resetRequestId;
user.passwordResetAt = null;

await user.save();
   
    await sendMail(email, plainToken, "reset");

    return NextResponse.json(
      {
        success: true,
        code:SUCCESS_CODES.PASSWORD_RESET_EMAIL_SENT,
        message:SUCCESS_MESSAGES.PASSWORD_RESET_EMAIL_SENT,
        resetRequestId
      },
      { status: 200 }
    );

  }  catch (error:any) {

     console.log("Forget password error:", error.message);
  return errorHandler(error)
  }
}