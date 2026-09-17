import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";

import connectToDB from "@/app/dbconfig/db";
import { verifyAccessToken } from "@/app/lib/auth/token/token";
import BackupCode from "@/app/models/backupCode.model";

interface TokenPayload {
  id: string;
  type: string;
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("accessToken")?.value;

 
    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication token is missing",
        },
        { status: 401 }
      );
    }

 const jwtUserDetails = verifyAccessToken(accessToken)

    const { id: userID } = jwtUserDetails as TokenPayload;

    await connectToDB();

    const currentUser = await User.findById(userID)
      .select("-password");


    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
      
let backupCodesRemaining  =0
if(currentUser.twoFactorEnabled){
  const backupCodes =await BackupCode.findOne({userId :userID})

  if(!backupCodes){
    backupCodesRemaining =0
  }else{
   backupCodesRemaining = backupCodes?.codes.filter((code)=>{
   return  code.usedAt ===null
  }).length
  }


}

    return NextResponse.json(
      {
        success: true,
        message: "Current user details fetched successfully",
        user: currentUser,
        backupCodesRemaining
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Something went wrong:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired authentication token",
      },
      { status: 401 }
    );
  }
}