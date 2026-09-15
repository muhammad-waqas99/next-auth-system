import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/app/models/user.model";

import connectToDB from "@/app/dbconfig/db";
import { loginSchema } from "@/app/lib/validationSchema/auth.schema";
import { createAccessToken, generateRefreshToken, generateSessionId, hashRefreshToken } from "@/app/lib/auth/token";
import RefreshToken from "@/app/models/refreshToken.model";
import { UAParser } from "ua-parser-js";


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

    
  const accessPayload = {
    id: user.id,
    type:"access"
  }
 const accessToken = createAccessToken(accessPayload)

 const refreshToken = generateRefreshToken()

 const hashedRefreshToken = hashRefreshToken(refreshToken)

 const currentDate =Date.now()
 const expiryDate = new Date(currentDate + 6.048e+8)

 const sessionExpiresAt = new Date(currentDate + 2.592e+9)

 const sessionId = generateSessionId()



const userAgent = request.headers.get("user-agent") ?? "";

const parser = new UAParser(userAgent);

const browser = parser.getBrowser().name || "Unknown";
const os = parser.getOS().name || "Unknown";

const deviceInfo = parser.getDevice();
const device = deviceInfo.type || "Desktop";


 const newRefreshToken = new RefreshToken({
   userId : user.id,
   expiresAt:expiryDate,
   sessionExpiresAt,
   tokenHash:hashedRefreshToken,
   sessionId,
   os,
   browser,
   device
 })


 await newRefreshToken.save()








  const response = NextResponse.json(
    { success: true, message: 'Logged in successfully' },
    { status: 200 }
  );

  response.cookies.set({
    name: 'accessToken',
    value: accessToken,
    httpOnly: true,
    sameSite: "lax", 
  
    maxAge: 60 *15, 
   
  });
  response.cookies.set({
    name: 'refreshToken',
    value: refreshToken,
    httpOnly: true,
    sameSite: "lax", 
  
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