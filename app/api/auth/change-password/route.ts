import { NextRequest, NextResponse } from "next/server";


import { changePasswordSchema } from "@/app/lib/validationSchema/auth.schema";
import requireAuth from "@/app/lib/auth/requireAuth";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { InvalidPasswordError } from "@/app/lib/errors/InvalidPasswordError";
import { comparePassword, hashPassword } from "@/app/lib/auth/password/password";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import { AppError } from "@/app/lib/errors/AppError";
import { ERROR_CODES, ERROR_MESSAGES, SUCCESS_CODES, SUCCESS_MESSAGES } from "@/app/lib/errors/messages";



export async function POST(request: NextRequest) {
  try {
const body  = await request.json();

const { currentPassword, newPassword } = validateRequest(
  changePasswordSchema,
  body
);



  

    const {user} = await requireAuth(request,{
      includePassword :true
    })



  

    if (!user.password) {
     throw new AppError(
      ERROR_CODES.PASSWORD_LOGIN_UNAVAILABLE,
      ERROR_MESSAGES.PASSWORD_LOGIN_UNAVAILABLE,
      400
     )
    }

    const checkPassword =  await comparePassword(
  currentPassword,
  user.password
);

if (!checkPassword) {
  throw new InvalidPasswordError();
}


  

    const newPasswordHashed = await hashPassword(newPassword)
    user.password = newPasswordHashed;

    await user.save();

    return NextResponse.json(
      {
        success: true,
        code:SUCCESS_CODES.PASSWORD_CHANGED,
        message:SUCCESS_MESSAGES.PASSWORD_CHANGED,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Change password error:", error.message);

      return errorHandler(error)
  }
}