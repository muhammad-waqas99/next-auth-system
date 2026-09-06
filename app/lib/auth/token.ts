import jwt from "jsonwebtoken" 
import crypto from 'crypto' 
type Payload ={ 
    id:string, 
    type:string 
} 
 
 
const JWT_SECRET=process.env.JWT_SECRET 
 
if(!JWT_SECRET){ 
    throw new Error("jwt secret required") 
} 
export function createAccessToken(payload:Payload){ 
 
try { 
     
    const accessToken =jwt.sign(payload,JWT_SECRET!,{expiresIn:"15m"}) 
 
    return accessToken; 
} catch (error:any) { 
    console.log("error in createAccessToken : Error  " , error.message) 
   throw new Error("error in createAccessToken Error : " , error.message) 
     
} 
} 
 
export function verifyAccessToken(accessToken:string){ 
     
    try { 
        const accessTokenDetails =jwt.verify(accessToken,JWT_SECRET!) 
 
          
            if (typeof accessTokenDetails === "string") { 
                 throw new Error("invalid or expire accessToken") 
            } 
        return accessTokenDetails 
 
 
         
    } catch (error:any) { 
        console.log(`Error in verifyAccessToken : Error  ${error.message}`) 
        throw new Error("invalid or expire accessToken") 
    } 
 
 
 
} 
 
 
export function generateRefreshToken(){ 
 try { 
    const refreshToken = crypto.randomBytes(64).toString("hex") 
    return refreshToken 
 } catch (error:any) { 
    throw new Error(`Error in generateRefreshToken Error :  ${error.message} `) 
 } 
} 
export function hashRefreshToken(token:string){ 
 try { 
    const hashRefreshTokenrefreshToken = crypto.createHash('sha256').update(token).digest("hex") 
    return hashRefreshToken 
 } catch (error:any) { 
    throw new Error(`Error in hashRefreshToken Error :  ${error.message}`) 
 } 
} 
