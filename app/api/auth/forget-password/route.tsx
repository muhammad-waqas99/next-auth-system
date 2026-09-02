import connectToDB from "@/app/dbconfig/db";
import crypto from "node:crypto";
import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import sendMail from "@/app/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { email } = reqBody;

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
          message: "User does not exist",
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


    user.resetPasswordToken = hashToken;

    user.resetPasswordTokenExpiry =
      resetPasswordTokenExpiry;

    await user.save();

   
    await sendMail(email, plainToken, "reset");

    return NextResponse.json(
      {
        success: true,
        message: "Reset password email sent successfully",
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.log(error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}