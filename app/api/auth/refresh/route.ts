import connectToDB from "@/app/dbconfig/db";
import { validateRefreshToken } from "@/app/lib/auth/refreshToken/refreshToken";
import { createAccessToken, generateRefreshToken, hashRefreshToken,  } from "@/app/lib/auth/token/token";
import { AppError } from "@/app/lib/errors/AppError";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { UnauthorizedError } from "@/app/lib/errors/UnauthorizedError";
import RefreshToken from "@/app/models/refreshToken.model";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request : NextRequest){


  try {
    
      const {session} = await validateRefreshToken(request)

     const userId = session.userId.toString()
  const newRefreshToken = generateRefreshToken()
  const newHashedRefreshToken = hashRefreshToken(newRefreshToken).toString()
  const accessPayload={
    id:userId,
    type:"access"
  }
  const newAccessToken = createAccessToken(accessPayload)


 const currentDate = new Date()
   const expiryDate = new Date(currentDate.getTime() + 6.048e+8)

 

   session.revokedAt = currentDate;


await session.save()

const newRotateRefreshToken = new RefreshToken({
    expiresAt:expiryDate,
    sessionExpiresAt:session.sessionExpiresAt,
    userId:session.userId,
    tokenHash:newHashedRefreshToken,
    sessionId:session.sessionId,
    lastUsedAt:currentDate,
      os: session.os,
  browser: session.browser,
  device: session.device,
    

})

await newRotateRefreshToken.save()
  const response = NextResponse.json(
    { success: true, message: 'Refresh token rotate successfully' },
    { status: 200 }
  );

  response.cookies.set({
    name: 'accessToken',
    value: newAccessToken,
    httpOnly: true,
    sameSite: "lax", 
  
    maxAge: 60 *15, 
   
  });
  response.cookies.set({
    name: 'refreshToken',
    value: newRefreshToken,
    httpOnly: true,
    sameSite: "lax", 
  
    maxAge: 60 * 60 * 24 * 7, 
   
  });

  return response;

} catch (error: any) {
  console.log("Refresh error:", error.message);

  if (error instanceof UnauthorizedError) {
    const response = NextResponse.json(
      {
        success: false,
        code: error.code,
        message: error.message,
      },
      { status: 401 }
    );

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");

    return response;
  }

  return errorHandler(error);
}}