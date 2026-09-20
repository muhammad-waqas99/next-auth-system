import connectToDB from "@/app/dbconfig/db";
import { clearAuthCookies, setAuthCookies } from "@/app/lib/auth/cookies/cookies";
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

setAuthCookies(response, newAccessToken, newRefreshToken);
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
 clearAuthCookies(response)

    return response;
  }

  return errorHandler(error);
}}