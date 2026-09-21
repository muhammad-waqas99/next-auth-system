import { NextRequest, NextResponse } from "next/server";

import User from "@/app/models/user.model";
import connectToDB from "@/app/dbconfig/db";
import crypto from "crypto";
import sendMail from "@/app/lib/mail";

import { signupSchema } from "@/app/lib/validationSchema/auth.schema";
import { hashPassword } from "@/app/lib/auth/password/password";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";

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

    const { name, email, password } = validateRequest(
      signupSchema,
      body
    );

    await connectToDB();

    const user = await User.findOne({ email });
    const isGoogleUser = !!user?.googleId;

    if (isGoogleUser && user) {
      throw new AppError(
        ERROR_CODES.GOOGLE_ACCOUNT_EXISTS,
        ERROR_MESSAGES.GOOGLE_ACCOUNT_EXISTS,
        400
      );
    }

    if (user) {
      throw new AppError(
        ERROR_CODES.USER_ALREADY_EXISTS,
        ERROR_MESSAGES.USER_ALREADY_EXISTS,
        409
      );
    }

    const hashedPassword = await hashPassword(password);

    const verificationToken = crypto
      .randomBytes(32)
      .toString("hex");

    const verificationTokenExpiry = new Date(
      Date.now() + 3600000
    );

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      authProvider: "local",
      verificationToken,
      verificationTokenExpiry,
    });

    await newUser.save();

    await sendMail(email, verificationToken, "verify");

    return NextResponse.json(
      {
        success: true,
        message: SUCCESS_MESSAGES.SIGNUP_SUCCESS,
        code: SUCCESS_CODES.SIGNUP_SUCCESS,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.log(
      "Signup error:",
      error instanceof Error ? error.message : error
    );

    return errorHandler(error);
  }
}