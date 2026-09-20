import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";

import connectToDB from "@/app/dbconfig/db";
import { verifyAccessToken } from "@/app/lib/auth/token/token";
import BackupCode from "@/app/models/backupCode.model";
import requireAuth from "@/app/lib/auth/requireAuth";
import { errorHandler } from "@/app/lib/errors/errorHandler";

interface TokenPayload {
  id: string;
  type: string;
}

export async function GET(request: NextRequest) {
  try {
  const {userId } =await requireAuth(request)

    await connectToDB();

    const currentUser = await User.findById(userId)
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
  const backupCodes =await BackupCode.findOne({userId :userId})

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

    return errorHandler(error)
  }
}