
import { comparePassword } from "@/app/lib/auth/password/password";
import requireAuth from "@/app/lib/auth/requireAuth";
import { generateRegenerateChallenge,  hashRegenerateChallenge } from "@/app/lib/auth/token/token";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import RegenerateChallenge from "@/app/models/backupCodeRegenerateChallenge.model";

import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request:NextRequest){
try {
  
 const {user , userId} = await requireAuth(request,{
  includePassword:true
 })
  
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

       return errorHandler(error)
  }


}
