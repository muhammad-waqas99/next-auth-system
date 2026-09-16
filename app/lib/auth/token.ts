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
     
    const accessToken =jwt.sign(payload,JWT_SECRET!,{expiresIn:"15s"}) 
 
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
export function generateSessionId(){ 
 try { 
    const sessionId = crypto.randomBytes(16).toString("hex") 
    return sessionId
 } catch (error:any) { 
    throw new Error(`Error in generateSessionId Error :  ${error.message} `) 
 } 
} 
export function hashRefreshToken(token:string){ 
 try { 
    const hashRefreshToken = crypto.createHash('sha256').update(token).digest("hex") 
    return hashRefreshToken 
 } catch (error:any) { 
    throw new Error(`Error in hashRefreshToken Error :  ${error.message}`) 
 } 
} 


export function generateLoginChallenge(){
 try {
    const loginChallenge = crypto.randomBytes(32).toString("hex")
    return loginChallenge
 } catch (error:any) {
    throw new Error(`Error in generateLoginChallenge Error :  ${error.message} `)
 }
}

export function hashLoginChallenge(challenge:string){
 try {
    const hashLoginChallenge = crypto.createHash('sha256').update(challenge).digest("hex")
    return hashLoginChallenge
 } catch (error:any) {
    throw new Error(`Error in hashLoginChallenge Error :  ${error.message}`)
 }
}
export function generateDisableChallenge(){
 try {
    const loginChallenge = crypto.randomBytes(32).toString("hex")
    return loginChallenge
 } catch (error:any) {
    throw new Error(`Error in generateLoginChallenge Error :  ${error.message} `)
 }
}

export function hashDisableChallenge(challenge:string){
 try {
    const hashLoginChallenge = crypto.createHash('sha256').update(challenge).digest("hex")
    return hashLoginChallenge
 } catch (error:any) {
    throw new Error(`Error in hashLoginChallenge Error :  ${error.message}`)
 }
}

export function generateBackupCodes() {
  try {
    const codes: string[] = [];
    const hashes: string[] = [];

    for (let i = 0; i < 8; i++) {
      const code = crypto.randomInt(1000000000, 10000000000).toString();

      const codeHash = crypto
        .createHash("sha256")
        .update(code)
        .digest("hex");

      codes.push(code);
      hashes.push(codeHash);
    }

    return {
      codes,
      hashes,
    };
  } catch (error: any) {
    throw new Error(
      `Error in generateBackupCodes Error: ${error.message}`
    );
  }
}
