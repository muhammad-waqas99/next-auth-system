import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import User from "@/app/models/user.model";
import connectToDB from "@/app/dbconfig/db";
import crypto from 'crypto';
import sendMail from "@/app/lib/mail";
interface ReqBody {
  name: string;
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const reqBody: ReqBody = await request.json();

    const { name, email, password } = reqBody;

    if (!name || !email || !password) {
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

    if (user) {
      return NextResponse.json(
        {
          success: false,
          message: "User already exists",
        },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

     const verificationToken =  crypto.randomBytes(32).toString('hex');
     const verificationTokenExpiry = new Date(Date.now() + 3600000)



    const newUser = new User({
      name,
      email,
      password: hashedPassword,
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