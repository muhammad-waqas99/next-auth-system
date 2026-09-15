import connectToDB from "@/app/dbconfig/db";
import { verifyAccessToken } from "@/app/lib/auth/token";
import RefreshToken from "@/app/models/refreshToken.model";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest){
   try {
        const accessToken = request.cookies.get('accessToken')?.value.toString()

    if(!accessToken){
        return NextResponse.json({success:false , message : "Access token Required"} , {status: 401})
    }

    const accessTokenData = verifyAccessToken(accessToken)
    if(!accessTokenData){
        return NextResponse.json({success:false, message: "invalid access Token"} , {status : 401})
    }

    const userId = accessTokenData.id;

    await connectToDB()
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

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }


}