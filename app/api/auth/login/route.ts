import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/app/models/user.model";
import jwt from "jsonwebtoken"
import connectToDB from "@/app/dbconfig/db";
import { loginSchema } from "@/app/lib/validationSchema/auth.schema";

interface ReqBody {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const reqBody: ReqBody = await request.json();


const result = loginSchema.safeParse(reqBody);

if (!result.success) {
  return NextResponse.json(
    {
      success: false,
      message: result.error.issues[0].message,
    },
    { status: 400 }
  );
}


    const {  email, password } = result.data;

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
if (user && user.authProvider === "google") {
    return NextResponse.json({
        success: false,
        message: "Password login is not available for this account."
    })
}

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }
    if (!user.password) {
  return NextResponse.json({
    success: false,
    message: "Password login is not available for this account.",
  });
}

    const checkPassword = await bcrypt.compare(password, user.password)

    if(!checkPassword){
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }


    if(!user.isVerified){
      return NextResponse.json({
  "success": false,
  "message": "Please verify your email before logging in. Check your inbox for the verification link."
},{status:403})
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

  } catch (error:any) {

     console.log("Login error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}