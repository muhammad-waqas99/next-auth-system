import connectToDB from "@/app/dbconfig/db";
import { hashRefreshToken } from "@/app/lib/auth/token";
import RefreshToken from "@/app/models/refreshToken.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {

    const refreshToken = request.cookies.get('refreshToken')?.value.toString()
          if (  !refreshToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

   const hashedRefreshToken = hashRefreshToken(refreshToken).toString()
await connectToDB()
   const checkRefreshToken = await RefreshToken.findOne({tokenHash:hashedRefreshToken})
 
   if(!checkRefreshToken || checkRefreshToken.revokedAt !==null){
    return NextResponse.json({success:false , message : "invalid Refresh Token "} , {status: 401})
   }


   checkRefreshToken.revokedAt = new Date()

   await checkRefreshToken.save()


   

    const response = NextResponse.json(
      {
        success: true,
        message: "Logout successful",
      },
      { status: 200 }
    );

    response.cookies.delete("refreshToken");
    response.cookies.delete("accessToken");



    return response;
  } catch (error: any) {
    console.log("Error in Logout:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}