import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectToDB from "@/app/dbconfig/db";

interface TokenPayload {
  id: string;
  email: string;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

 
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication token is missing",
        },
        { status: 401 }
      );
    }

  
    const jwtUserDetails = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );

 
    if (typeof jwtUserDetails === "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token payload",
        },
        { status: 401 }
      );
    }

    const { id: userID } = jwtUserDetails as TokenPayload;

    await connectToDB();

    const currentUser = await User.findById(userID)
      .select("-password");


    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Current user details fetched successfully",
        user: currentUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Something went wrong:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid or expired authentication token",
      },
      { status: 401 }
    );
  }
}