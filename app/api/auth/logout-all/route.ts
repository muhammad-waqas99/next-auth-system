import connectToDB from "@/app/dbconfig/db";
import requireAuth from "@/app/lib/auth/requireAuth";
import { verifyAccessToken } from "@/app/lib/auth/token/token";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import RefreshToken from "@/app/models/refreshToken.model";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest){
   try {
  await connectToDB()
  const {user, userId} = await requireAuth(request)
    await RefreshToken.updateMany({
        userId , revokedAt : null,
    },{
        $set:{revokedAt : new Date()}
    })

    const response = NextResponse.json({success:true , message : "Logout from all devices successful "} , {status: 200})
    response.cookies.delete('accessToken')
    response.cookies.delete('refreshToken')

    return response
    
   } catch (error: any) {
    console.log("Error in Logout All:", error.message);

      return errorHandler(error)
  }


}