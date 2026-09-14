import connectToDB from "@/app/dbconfig/db";
import { createAccessToken, generateRefreshToken, hashRefreshToken,  } from "@/app/lib/auth/token";
import RefreshToken from "@/app/models/refreshToken.model";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request : NextRequest){


  try {
    

    const refreshToken = request.cookies.get('refreshToken')?.value.toString()


      if (  !refreshToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }



await connectToDB()
  const hashedRefreshToken = hashRefreshToken(refreshToken).toString()

 const refreshTokenCheck = await RefreshToken.findOne({tokenHash:hashedRefreshToken})


 if(!refreshTokenCheck){
    return NextResponse.json({success : false , message: "invalid Refresh Token "} , {status:401})
 }

 const revokedAt =refreshTokenCheck.revokedAt

const currentDate = new Date()

 if(revokedAt !== null || refreshTokenCheck.expiresAt < currentDate || refreshTokenCheck.sessionExpiresAt < currentDate){
       
    return NextResponse.json({success : false , message: "refresh token is expired"} , {status:401})
 
 }

     const userId = refreshTokenCheck.userId.toString()
  const newRefreshToken = generateRefreshToken()
  const newHashedRefreshToken = hashRefreshToken(newRefreshToken).toString()
  const accessPayload={
    id:userId,
    type:"access"
  }
  const newAccessToken = createAccessToken(accessPayload)



   const expiryDate = new Date(currentDate.getTime() + 6.048e+8)

 

   refreshTokenCheck.revokedAt = currentDate;

await refreshTokenCheck.save()

const newRotateRefreshToken = new RefreshToken({
    expiresAt:expiryDate,
    sessionExpiresAt:refreshTokenCheck.sessionExpiresAt,
    userId:refreshTokenCheck.userId,
    tokenHash:newHashedRefreshToken,
    sessionId:refreshTokenCheck.sessionId

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

  } catch (error:any) {

     console.log("Login error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }

}