
import { comparePassword } from "@/app/lib/auth/password/password";
import requireAuth from "@/app/lib/auth/requireAuth";
import { generateDisableChallenge, hashDisableChallenge } from "@/app/lib/auth/token/token";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { disableTwoFactorSchema } from "@/app/lib/validationSchema/auth.schema";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";

import DisableChallenge from "@/app/models/twoFactorDisableChallenge.model";


import { NextRequest, NextResponse } from "next/server";

export async function POST(request : NextRequest){

    try {
        
const body = await request.json();

const {  password } = validateRequest(
  disableTwoFactorSchema,
  body
);




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

    const checkPassword = await comparePassword(password , user.password)
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