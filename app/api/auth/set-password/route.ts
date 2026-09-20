import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";



import { setPasswordSchema } from "@/app/lib/validationSchema/auth.schema";

import requireAuth from "@/app/lib/auth/requireAuth";

import { errorHandler } from "@/app/lib/errors/errorHandler";


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


       const {user } = await requireAuth(request,{
        includePassword:true
       })

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

 return errorHandler(error)
  }
}