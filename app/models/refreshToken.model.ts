import mongoose from 'mongoose'
interface IRefreshToken{
    userId : mongoose.Schema.Types.ObjectId;
    tokenHash : string;
    expiresAt : Date;
    revokedAt : Date | null;
    sessionId: string;
    sessionExpiresAt : Date;


}

const refreshTokenSchema = new mongoose.Schema<IRefreshToken>({
 userId :{
     type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
 },
 tokenHash:{
    type:String,
    required:true
 },
 expiresAt:{
    type:Date,
    required:true
 },
revokedAt:{
      type:Date,
    default:null
},
sessionExpiresAt:{
      type:Date,
    required:true
},
sessionId:{
    type:String,
    required:true
}


})


const RefreshToken = mongoose.model<IRefreshToken>("RefreshToken", refreshTokenSchema);

export default RefreshToken;