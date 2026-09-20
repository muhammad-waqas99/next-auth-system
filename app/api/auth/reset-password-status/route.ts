import connectToDB from "@/app/dbconfig/db";
import User from "@/app/models/user.model";
import { resetPasswordStatusSchema } from "@/app/lib/validationSchema/auth.schema";
import { NextRequest, NextResponse } from "next/server";
import { validateRequest } from "@/app/lib/validationSchema/validateRequest";
import { errorHandler } from "@/app/lib/errors/errorHandler";

export async function GET(request: NextRequest) {
  try {
    const resetRequestId =
      request.nextUrl.searchParams.get("resetRequestId");
const { resetRequestId: validResetRequestId } = validateRequest(
  resetPasswordStatusSchema,
  { resetRequestId }
);
    await connectToDB();

    const user = await User.findOne({
      resetRequestId: validResetRequestId,
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid reset request",
        },
        { status: 404 }
      );
    }

    const isReset = !!user.passwordResetAt;

    return NextResponse.json(
      {
        success: true,
        isReset,
        message: isReset
          ? "Password has been reset successfully"
          : "Password reset is still pending",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("Reset status error:", error.message);

return errorHandler(error)
  }
}