
import { NextRequest, NextResponse } from "next/server";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";
import requireAuth from "@/app/lib/auth/requireAuth";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { comparePassword } from "@/app/lib/auth/password/password";
import { setupTwoFactorSchema } from "@/app/lib/validationSchema/auth.schema";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";

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

const body = await request.json();

const {  password } = validateRequest(
  setupTwoFactorSchema,
  body
);




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