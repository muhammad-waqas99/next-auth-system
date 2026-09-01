import connectToDB from "@/app/dbconfig/db";
import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export  async function POST(request:NextRequest) {
    
    const { token } = await request.json();
       

    if(!token){
        return NextResponse.json({
            success:false,
            message:"invalid Token"
        })
    }
    await connectToDB()

    const user = await User.findOne({verificationToken:token})

    if(!user){
                return NextResponse.json({
            success:false,
            message:"invalid Token"
        })
    }

const isExpired =
  user.verificationTokenExpiry &&
  user.verificationTokenExpiry.getTime() < Date.now();

if (isExpired) {
           return NextResponse.json({
            success:false,
            message:"Verification Email Expire"
        })
}
 user.verificationToken = undefined
user.verificationTokenExpiry = undefined
user.isVerified = true
  await user.save()
 

        return NextResponse.json({
            success:true,
            message:"User Verified Successfully"
        })

}


    

