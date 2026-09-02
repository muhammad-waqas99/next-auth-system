import connectToDB from "@/app/dbconfig/db";
import crypto from "node:crypto";
import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import sendMail from "@/app/lib/mail";
import { forgotPasswordSchema } from "@/app/lib/validationSchema/auth.schema";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const result = forgotPasswordSchema.safeParse(reqBody);
    
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0].message,
        },
        { status: 400 }
      );
    }
    
    const { email } = result.data;


    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "If an account exists with this email, a reset link has been sent.",
        },
        { status: 404 }
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
        message: "Reset password email sent successfully",
        resetRequestId
      },
      { status: 200 }
    );

  }  catch (error:any) {

     console.log("Forget password error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}