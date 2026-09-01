import connectToDB from "@/app/dbconfig/db";
import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request :NextRequest){

try {
      const {email} = await request.json()

  if(!email){
    return NextResponse.json({
        success:false,
        isVerified:false,
        message:"Something Went Wrong \n Email is Missing"
    },{status:400})
  }
 await connectToDB()
  const user = await User.findOne({email})

  if(!user){
        return NextResponse.json({
        success:false,
        isVerified:false,
        message:"Invalid Email"
    },{status:404})
  }


  if(user.isVerified){
    return NextResponse.json({
        isVerified:true,
        success:true,
        message:"User Verified successfully "
    },{status:200})
  }else{
        return NextResponse.json({
        isVerified:false,
        success:true,
        message:"Email is not Verified Yet"
    })
  }

} catch (error :any) {
      console.log(error.message)   
    return NextResponse.json({
        success:false,
        isVerified:false,
        message:"Something Went Wrong"
    },{status:500})
      
}


}