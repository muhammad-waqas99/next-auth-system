import connectToDB from "@/app/dbconfig/db";
import { generateDisableChallenge, hashDisableChallenge, hashRefreshToken } from "@/app/lib/auth/token/token";
import RefreshToken from "@/app/models/refreshToken.model";
import DisableChallenge from "@/app/models/twoFactorDisableChallenge.model";
import User from "@/app/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request : NextRequest){

    try {
        
        const reqBody = await request.json()
        const password = reqBody.password

        if(!password){
            return NextResponse.json({success : false ,message: "password is Required"} , {status:400})
        }

const refreshToken = request.cookies
      .get("refreshToken")
      ?.value.toString();

    if (!refreshToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    await connectToDB();

    const hashedRefreshToken = hashRefreshToken(refreshToken).toString();

    const refreshTokenCheck = await RefreshToken.findOne({
      tokenHash: hashedRefreshToken,
    });

    if (!refreshTokenCheck) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired refresh token",
        },
        { status: 401 }
      );
    }

    const userId = refreshTokenCheck.userId;

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }
    if (!user.password) {
    return NextResponse.json(
        {
            success: false,
            message: "Please set a password before disabling 2FA",
        },
        { status: 400 }
    );
}

  
    if (!user.twoFactorEnabled) {
      return NextResponse.json(
        {
          success: false,
          message: "2FA is already disabled",
        },
        { status: 400 }
      );
    }

    const checkPassword = await bcrypt.compare(password , user.password)
    if(!checkPassword){
        return NextResponse.json({success: false , message : "incorrect password"} , {status: 401})
    }

     const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
     const disableChallenge = generateDisableChallenge();
      const challengeHash = hashDisableChallenge(disableChallenge);
      

      await DisableChallenge.create({
        userId: user.id,
        challengeHash,
        expiresAt,
      });

      return NextResponse.json(
        {
          success: true,
          passwordCheck: true,
          challenge: disableChallenge,
          message: "Password verified and challenge created",
        },
        { status: 200 }
      );
    


        
    }catch (error: any) {
    console.log("2FA verification error:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}