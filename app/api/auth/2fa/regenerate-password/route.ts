import connectToDB from "@/app/dbconfig/db";
import { generateRegenerateChallenge, hashRefreshToken, hashRegenerateChallenge } from "@/app/lib/auth/token/token";
import RegenerateChallenge from "@/app/models/backupCodeRegenerateChallenge.model";
import RefreshToken from "@/app/models/refreshToken.model";
import User from "@/app/models/user.model";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){
try {
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

    const hashedRefreshToken = hashRefreshToken(refreshToken);

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

    const userId = refreshTokenCheck.userId.toString();

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

  
if (!user.twoFactorEnabled || !user.twoFactorSecret)  {
      return NextResponse.json(
        {
          success: false,
          message: "2FA is not properly configured ",
        },
        { status: 400 }
      );
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
    
      
        const isPasswordCorrect = await bcrypt.compare(
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
    

         const challenge = generateRegenerateChallenge()
         const hashChallenge = hashRegenerateChallenge(challenge)
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
         await RegenerateChallenge.create({
            userId,
            challengeHash:hashChallenge,
            expiresAt

         })

         return NextResponse.json({success:true , message : "Password Verified Chalenge Created" , challenge} ,{status:200})



} catch (error: any) {
    console.log("Regenerate Password  error:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }


}
