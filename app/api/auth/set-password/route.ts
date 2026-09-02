import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDB from "@/app/dbconfig/db";
import User from "@/app/models/user.model";
import bcrypt from "bcryptjs";
import { setPasswordSchema } from "@/app/lib/validationSchema/auth.schema";

interface TokenPayload {
  id: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();

    const result = setPasswordSchema.safeParse(reqBody);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.error.issues[0].message,
        },
        { status: 400 }
      );
    }

    const { newPassword } = result.data;

    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as TokenPayload;

    if (!decodedToken.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 }
      );
    }

    await connectToDB();

    const user = await User.findById(decodedToken.id);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }


    if (user.authProvider !== "google") {
      return NextResponse.json(
        {
          success: false,
          message: "Password is already set for this account",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.authProvider = "both";

    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Password set successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Set password error:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}