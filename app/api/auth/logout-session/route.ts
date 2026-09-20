import connectToDB from "@/app/dbconfig/db";
import requireAuth from "@/app/lib/auth/requireAuth";
import { verifyAccessToken } from "@/app/lib/auth/token/token";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import RefreshToken from "@/app/models/refreshToken.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request : NextRequest){

try {
        const reqBody = await request.json()
    const sessionId = reqBody.sessionId
     if(!sessionId){
        return NextResponse.json({success : false , message: "Session Id Required"} , {status:404})
     }

 await connectToDB()
 const {userId}=await requireAuth(request)
    const session = await RefreshToken.updateOne({userId ,sessionId, revokedAt: null}, {revokedAt:new Date()})
if (session.matchedCount === 0) {
  return NextResponse.json(
    { success: false, message: "Invalid session id" },
    { status: 401 }
  );
}

    return NextResponse.json({success: true , message : "logout session successful " } , {status: 200})
} catch (error: any) {
    console.log("Error in Logout Session:", error.message);

    return errorHandler(error)
  }
}