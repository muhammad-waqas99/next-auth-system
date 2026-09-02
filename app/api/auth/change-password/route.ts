import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDB from "@/app/dbconfig/db";
import User from "@/app/models/user.model";
import bcrypt from "bcryptjs";
import { changePasswordSchema } from "@/app/lib/validationSchema/auth.schema";

interface TokenPayload {
  id: string;
  email: string;
}

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    const reqBody: ChangePasswordBody = await request.json();
const result = changePasswordSchema.safeParse(reqBody);

if (!result.success) {
  return NextResponse.json(
    {
      success: false,
      message: result.error.issues[0].message,
    },
    { status: 400 }
  );
}
    const { currentPassword, newPassword, confirmPassword } = result.data;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

  
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or empty authentication token",
        },
        { status: 401 }
      );
    }

   
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

  
    if (typeof decodedToken === "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token payload",
        },
        { status: 401 }
      );
    }

    const userID = (decodedToken as TokenPayload).id;


    await connectToDB();

   
    const user = await User.findById(userID);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }
    if (!user.password) {
  return NextResponse.json({
    success: false,
    message: "Password login is not available for this account.",
  });
}
    const checkPassword =  bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!checkPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Incorrect current password",
        },
        { status: 401 }
      );
    }

  
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "New password and confirm password do not match",
        },
        { status: 400 }
      );
    }

   
    const salt = await bcrypt.genSalt(10);

    const newPasswordHashed = await bcrypt.hash(
      newPassword,
      salt
    );

  
    user.password = newPasswordHashed;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Change password error:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}