import { createAccessToken, generateRefreshToken, generateSessionId, hashLoginChallenge, hashRefreshToken } from "@/app/lib/auth/token/token";
import BackupCode from "@/app/models/backupCode.model";
import LoginChallenge from "@/app/models/loginChallenge.model";
import RefreshToken from "@/app/models/refreshToken.model";
import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto"
import { UAParser } from "ua-parser-js";

export async function POST(request:NextRequest) {
try {
        const reqBody = await request.json()
     const {challenge , backupCode } =reqBody

     if(!challenge ||!backupCode){
        return NextResponse.json({success:false ,message: "challenge and backup code required"} , {status:400})
     }


    const challengeHash = hashLoginChallenge(challenge);

    const loginChallenge = await LoginChallenge.findOne({
      challengeHash,
    });

    if (!loginChallenge) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid login challenge",
        },
        { status: 401 }
      );
    }

    if (loginChallenge.usedAt) {
      return NextResponse.json(
        {
          success: false,
          message: "Login challenge has already been used",
        },
        { status: 401 }
      );
    }

    if (loginChallenge.expiresAt < new Date()) {
      return NextResponse.json(
        {
          success: false,
          message: "Login challenge has expired",
        },
        { status: 401 }
      );
    }

    const userId = loginChallenge.userId.toString()
    const backupCodeHash = crypto
            .createHash("sha256")
            .update(backupCode)
            .digest("hex");
    
const result = await BackupCode.updateOne(
  {
    userId,
    codes: {
      $elemMatch: {
        codeHash: backupCodeHash,
        usedAt: null,
      },
    },
  },
  {
    $set: {
      "codes.$.usedAt": new Date(),
    },
  }
);

if (result.modifiedCount === 0) {
 return NextResponse.json({success:false , message : "incorrect or expire backup code"} ,{status:401})
}


const challengeResult =await LoginChallenge.updateOne(
  {
    _id: loginChallenge._id,
    usedAt: null,
  },
  {
    $set: {
      usedAt: new Date(),
    },
  }
);

if (challengeResult.modifiedCount === 0) {
         return NextResponse.json(
        {
          success: false,
          message: "Login challenge has already been used",
        },
        { status: 401 }
      );
}
    const accessPayload = {
      id: userId,
      type: "access",
    };

    const accessToken = createAccessToken(accessPayload);

    const refreshToken = generateRefreshToken();

    const hashedRefreshToken = hashRefreshToken(refreshToken);

    const currentDate = Date.now();
    const expiryDate = new Date(currentDate + 6.048e8);

    const sessionExpiresAt = new Date(currentDate + 2.592e9);

    const sessionId = generateSessionId();

    const userAgent = request.headers.get("user-agent") ?? "";

    const parser = new UAParser(userAgent);

    const browser = parser.getBrowser().name || "Unknown";
    const os = parser.getOS().name || "Unknown";

    const deviceInfo = parser.getDevice();
    const device = deviceInfo.type || "Desktop";

    const newRefreshToken = new RefreshToken({
      userId,
      expiresAt: expiryDate,
      sessionExpiresAt,
      tokenHash: hashedRefreshToken,
      sessionId,
      os,
      browser,
      device,
    });

    await newRefreshToken.save();

    const response = NextResponse.json(
      { success: true, message: "Logged in successfully" },
      { status: 200 }
    );

    response.cookies.set({
      name: "accessToken",
      value: accessToken,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 15,
    });

    response.cookies.set({
      name: "refreshToken",
      value: refreshToken,
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

 return response
}  catch (error: any) {
    console.log("Backup Code Login error:", error.message);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong. Please try again later.",
      },
      { status: 500 }
    );
  }
}