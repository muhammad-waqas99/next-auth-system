import connectToDB from "@/app/dbconfig/db";
import { verifyAccessToken } from "@/app/lib/auth/token/token";
import RefreshToken from "@/app/models/refreshToken.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request : NextRequest){

try {
        const reqBody = await request.json()
    const sessionId = reqBody.sessionId
     if(!sessionId){
        return NextResponse.json({success : false , message: "Session Id Required"} , {status:404})
     }

     const accessToken = request.cookies.get("accessToken")?.value;

if (!accessToken) {
  return NextResponse.json(
    { success: false, message: "Access token required" },
    { status: 401 }
  );
}

const accessTokenData = verifyAccessToken(accessToken);
const userId = accessTokenData.id;
await connectToDB()
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

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}