import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";

import connectToDB from "@/app/dbconfig/db";
import RefreshToken from "@/app/models/refreshToken.model";
import { createAccessToken, generateRefreshToken, generateSessionId, hashRefreshToken } from "@/app/lib/auth/token";


export async function GET(request:NextRequest){


    
try {
        const code =  request.nextUrl.searchParams.get("code")
    if (!code) {
    return NextResponse.json(
        {
            success: false,
            message: "Authorization code missing"
        },
        { status: 400 }
    );
}
    const googleState = request.nextUrl.searchParams.get("state")

    const saveState = request.cookies.get("google-auth-state")?.value

    if(googleState !==saveState ){
        return NextResponse.json({success:false , message:"Invalid State"} , {status:401})
    }


    const tokenResponse = await fetch('https://oauth2.googleapis.com/token' , {
        method:"POST",
        headers:{
            "Content-Type":"application/x-www-form-urlencoded"
        },
        body:new URLSearchParams({

            code:code!,

            client_id:process.env.GOOGLE_CLIENT_ID!,
            client_secret:process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri:process.env.GOOGLE_REDIRECT_URI!,
            grant_type:"authorization_code"
        })
    })


    if(!tokenResponse.ok){
        return NextResponse.json({success:false , message : "access token required "})
    }
    const tokenData = await tokenResponse.json()

    const userResponse =await fetch(
        "https://openidconnect.googleapis.com/v1/userinfo",

        {headers:{
            Authorization:`Bearer ${tokenData.access_token}`
        }}
    )

    const googleUser = await userResponse.json()
    console.log(googleUser)


    const email = googleUser.email
    const name = googleUser.name 
    const isVerified = googleUser.email_verified;
    const googleID = googleUser.sub;

    if(!email || !name  || isVerified!==true || !googleID){
        return NextResponse.json({success:false , message:"All Fields Required"} )
    }

    await connectToDB()
    const user = await User.findOne({googleId:googleID})
    if(user) {
        user.isVerified=true

if (user.password !== null) {
    user.authProvider = "both"
} else {
    user.authProvider = "google"
}

        await user.save()


  const accessPayload = {
    id: user.id,
    type:"access"
  }
 const accessToken = createAccessToken(accessPayload)

 const refreshToken = generateRefreshToken()

 const hashedRefreshToken = hashRefreshToken(refreshToken)

 const currentDate =Date.now()
 const expiryDate = new Date(currentDate + 6.048e+8)

 const sessionExpiresAt = new Date(currentDate + 2.592e+9)

 const sessionId = generateSessionId()



 
 const newRefreshToken = new RefreshToken({
   userId : user.id,
   expiresAt:expiryDate,
   sessionExpiresAt,
   tokenHash:hashedRefreshToken,
   sessionId
 })


 await newRefreshToken.save()


    const response = NextResponse.redirect(
    new URL("/profile?message=google-login", request.url)
)

  response.cookies.set({
    name: 'accessToken',
    value: accessToken,
    httpOnly: true,
    sameSite: "lax", 
  
    maxAge: 60 *15, 
   
  });
  response.cookies.set({
    name: 'refreshToken',
    value: refreshToken,
    httpOnly: true,
    sameSite: "lax", 
  
    maxAge: 60 * 60 * 24 * 7, 
   
  });


  return response
    }

    const localUser =await User.findOne({email})

    if(localUser){

        localUser.authProvider="both"
        localUser.googleId =googleID;
        await localUser.save()


      
      
  const accessPayload = {
    id: localUser.id,
    type:"access"
  }
 const accessToken = createAccessToken(accessPayload)

 const refreshToken = generateRefreshToken()

 const hashedRefreshToken = hashRefreshToken(refreshToken)

 const currentDate =Date.now()
 const expiryDate = new Date(currentDate + 6.048e+8)

 const sessionExpiresAt = new Date(currentDate + 2.592e+9)

 const sessionId = generateSessionId()



 
 const newRefreshToken = new RefreshToken({
   userId : localUser.id,
   expiresAt:expiryDate,
   sessionExpiresAt,
   tokenHash:hashedRefreshToken,
   sessionId
 })


 await newRefreshToken.save()

    const response = NextResponse.redirect(
    new URL("/profile?message=google-linked", request.url)
)

  response.cookies.set({
    name: 'accessToken',
    value: accessToken,
    httpOnly: true,
    sameSite: "lax", 
  
    maxAge: 60 *15, 
   
  });
  response.cookies.set({
    name: 'refreshToken',
    value: refreshToken,
    httpOnly: true,
    sameSite: "lax", 
  
    maxAge: 60 * 60 * 24 * 7, 
   
  });

  return response
    }


    const newGoogleUser = new User({
        email,
        name,
        googleId:googleID,
        authProvider:"google",
        password:null,
        isVerified:true,

    })

    await newGoogleUser.save()

  const accessPayload = {
    id: newGoogleUser.id,
    type:"access"
  }
 const accessToken = createAccessToken(accessPayload)

 const refreshToken = generateRefreshToken()

 const hashedRefreshToken = hashRefreshToken(refreshToken)

 const currentDate =Date.now()
 const expiryDate = new Date(currentDate + 6.048e+8)

 const sessionExpiresAt = new Date(currentDate + 2.592e+9)

 const sessionId = generateSessionId()



 
 const newRefreshToken = new RefreshToken({
   userId : newGoogleUser.id,
   expiresAt:expiryDate,
   sessionExpiresAt,
   tokenHash:hashedRefreshToken,
   sessionId
 })


 await newRefreshToken.save()

 const response = NextResponse.redirect(
    new URL("/profile?message=local-g-login", request.url)
)

  response.cookies.set({
    name: 'accessToken',
    value: accessToken,
    httpOnly: true,
    sameSite: "lax", 
  
    maxAge: 60 *15, 
   
  });
  response.cookies.set({
    name: 'refreshToken',
    value: refreshToken,
    httpOnly: true,
    sameSite: "lax", 
  
    maxAge: 60 * 60 * 24 * 7, 
   
  });

  return response
    
} catch (error: any) {
    console.error("OAuth Handler Error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}