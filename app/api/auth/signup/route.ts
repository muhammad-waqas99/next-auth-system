import { NextRequest, NextResponse } from "next/server";

import User from "@/app/models/user.model";
import connectToDB from "@/app/dbconfig/db";
import crypto from 'crypto';
import sendMail from "@/app/lib/mail";

import { signupSchema } from "@/app/lib/validationSchema/auth.schema";
import { hashPassword } from "@/app/lib/auth/password/password";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";



export async function POST(request: NextRequest) {
  try {
const body = await request.json();

const { name, email, password } = validateRequest(
  signupSchema,
  body
);


    await connectToDB();

    const user = await User.findOne({ email });
       const isGoogleUser = !!user?.googleId;

       if(isGoogleUser && user){
          return NextResponse.json({
            success:false , 
            message:"Account already exists. Please continue with Google."
          })
       }

    if (user) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 409 }
      );
    }

   
    const hashedPassword = await hashPassword(password)

     const verificationToken =  crypto.randomBytes(32).toString('hex');
     const verificationTokenExpiry = new Date(Date.now() + 3600000)



    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      authProvider:"local",
      verificationToken,
      verificationTokenExpiry
    });

    await newUser.save();

    await sendMail(email,verificationToken,"verify")
  
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully \n Please check your email to verify your account.",
      },
      { status: 201 }
    );
  } catch (error:any) {

     console.log("Signup error:", error.message);
    return errorHandler(error)
  }
}