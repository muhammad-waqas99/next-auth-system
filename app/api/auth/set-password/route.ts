import { NextRequest, NextResponse } from "next/server";



import { setPasswordSchema } from "@/app/lib/validationSchema/auth.schema";

import requireAuth from "@/app/lib/auth/requireAuth";

import { errorHandler } from "@/app/lib/errors/errorHandler";
import { hashPassword } from "@/app/lib/auth/password/password";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";


export async function POST(request: NextRequest) {
  try {
const body = await request.json();

const { newPassword } = validateRequest(
  setPasswordSchema,
  body
);



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

    const hashedPassword = await hashPassword(newPassword)

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