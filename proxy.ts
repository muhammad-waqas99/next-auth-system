import { NextRequest, NextResponse } from "next/server";

export function proxy(request : NextRequest){
    const path = request.nextUrl.pathname;

    const isPublicPath = path==="/login" || path==="/signup"

    const token = request.cookies.get("token")?.value

    if(isPublicPath && token){
                return NextResponse.redirect(new URL('/' , request.nextUrl))
    }

    if(!isPublicPath && !token){
     
        return NextResponse.redirect(new URL('/signup' , request.nextUrl))
    }

    return NextResponse.next(); 
}

export const config={
    matcher:[
        '/',
        '/signup',
        '/login'
    ]
}