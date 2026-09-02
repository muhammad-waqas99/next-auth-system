import User from "@/app/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken"
import connectToDB from "@/app/dbconfig/db";


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


          const tokenData ={
              id:user._id.toString(),
              email:user.email,
          }
            const secret = process.env.JWT_SECRET
          const token = jwt.sign(tokenData ,secret! ,{expiresIn:"1d"})
      
      

    const response = NextResponse.redirect(
    new URL("/profile?message=google-login", request.url)
)

         response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true, 
  
    maxAge: 60 * 60 * 24 * 7, 
   
  });

  return response
    }

    const localUser =await User.findOne({email})

    if(localUser){

        localUser.authProvider="both"
        localUser.googleId =googleID;
        await localUser.save()

                  const tokenData ={
              id:localUser._id.toString(),
              email:localUser.email,
          }
            const secret = process.env.JWT_SECRET
          const token = jwt.sign(tokenData ,secret! ,{expiresIn:"1d"})
      
      

    const response = NextResponse.redirect(
    new URL("/profile?message=google-linked", request.url)
)

         response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true, 
  
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
                  const googleUsertokenData ={
              id:newGoogleUser._id.toString(),
              email:newGoogleUser.email,
          }
            const secret = process.env.JWT_SECRET
          const token = jwt.sign(googleUsertokenData ,secret! ,{expiresIn:"1d"})
 const response = NextResponse.redirect(
    new URL("/profile?message=local-g-login", request.url)
)

         response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true, 
  
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