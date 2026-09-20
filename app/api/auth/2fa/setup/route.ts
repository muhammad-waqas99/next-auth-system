
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";
import requireAuth from "@/app/lib/auth/requireAuth";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { comparePassword } from "@/app/lib/auth/password/password";

export async function POST(request: NextRequest) {
  try {

 const {user } = await requireAuth(request ,{
  includePassword:true
 })


    if (user.twoFactorEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: "2FA is already enabled",
        },
        { status: 400 }
      );
    }


    if (user.pendingTwoFactorSecret) {
      const now = new Date();

      if (
        user.pendingTwoFactorExpiresAt &&
        user.pendingTwoFactorExpiresAt > now
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "2FA setup is already in progress",
          },
          { status: 400 }
        );
      }

   
      user.pendingTwoFactorSecret = null;
      user.pendingTwoFactorExpiresAt = null;

      await user.save();
    }

    const reqBody = await request.json();

    const password = reqBody.password;

    if (!password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required",
        },
        { status: 400 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Please set a password before enabling 2FA",
        },
        { status: 400 }
      );
    }

  
    const isPasswordCorrect = await comparePassword(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect password",
        },
        { status: 401 }
      );
    }

    const userEmail = user.email;
    const issuer = process.env.ISSUER!;

    const secret = generateSecret();
      
  
    const pendingTwoFactorExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user.pendingTwoFactorSecret = secret;
    user.pendingTwoFactorExpiresAt = pendingTwoFactorExpiresAt;

    await user.save();

    const uri = generateURI({
      issuer,
      label: userEmail,
      secret,
    });

   

    const qrCode = await QRCode.toDataURL(uri);

    return NextResponse.json(
      {
        success: true,
        message: "2FA setup started",
        qrCode,
        secret,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("2FA setup error:", error.message);

 return errorHandler(error)
  }
}