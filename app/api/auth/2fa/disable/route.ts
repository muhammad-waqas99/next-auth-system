import connectToDB from "@/app/dbconfig/db";
import requireAuth from "@/app/lib/auth/requireAuth";
import { generateDisableChallenge, hashDisableChallenge, hashRefreshToken } from "@/app/lib/auth/token/token";
import { errorHandler } from "@/app/lib/errors/errorHandler";
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
await connectToDB()
 const {user } = await requireAuth(request ,{
  includePassword:true
 })
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

    return errorHandler(error)
  }
}