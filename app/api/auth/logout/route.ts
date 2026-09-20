import connectToDB from "@/app/dbconfig/db";
import { validateRefreshToken } from "@/app/lib/auth/refreshToken/refreshToken";
import requireAuth from "@/app/lib/auth/requireAuth";
import { hashRefreshToken } from "@/app/lib/auth/token/token";
import { errorHandler } from "@/app/lib/errors/errorHandler";
import { UnauthorizedError } from "@/app/lib/errors/UnauthorizedError";
import RefreshToken from "@/app/models/refreshToken.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
await connectToDB()
    const {userId} = await requireAuth(request)
     const {session} = await validateRefreshToken(request)


     if (session.userId.toString() !== userId) {
  throw new UnauthorizedError();
}
   session.revokedAt = new Date()

   await session.save()


   

    const response = NextResponse.json(
      {
        success: true,
        message: "Logout successful",
      },
      { status: 200 }
    );

    response.cookies.delete("refreshToken");
    response.cookies.delete("accessToken");



    return response;
  } catch (error: any) {
    console.log("Error in Logout:", error.message);

    return  errorHandler(error)
  }
}