import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/app/models/user.model";
import jwt from "jsonwebtoken"
import connectToDB from "@/app/dbconfig/db";

interface ReqBody {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const reqBody: ReqBody = await request.json();

    const {  email, password } = reqBody;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "email or password are incorrect",
        },
        { status: 400 }
      );
    }

    const checkPassword = await bcrypt.compare(password, user.password)

    if(!checkPassword){
      return NextResponse.json(
        {
          success: false,
          message: "email or password are incorrect",
        },
        { status: 400 }
      );
    }

    
    const tokenData ={
        id:user._id.toString(),
        email:user.email,
    }
      const secret = process.env.JWT_SECRET
    const token = jwt.sign(tokenData ,secret! ,{expiresIn:"1d"})



  const response = NextResponse.json(
    { success: true, message: 'Logged in successfully' },
    { status: 200 }
  );

  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true, 
  
    maxAge: 60 * 60 * 24 * 7, 
   
  });

  return response;

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}