import mongoose from "mongoose";
import { required } from "zod/mini";


interface IUser {
  name: string;
  email: string;
  password?: string;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  isVerified:boolean;
  resetRequestId:string;
  passwordResetAt:Date | null;
  googleId?:string;
  authProvider: "local" | "google" | "both"
}


const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    
  },
  isVerified:{
    type:Boolean,
    default:false
  },

  resetPasswordToken: {
    type: String,
  },

  resetPasswordTokenExpiry: {
    type: Date,
  },

  verificationToken: {
    type: String,
  },

  verificationTokenExpiry: {
    type: Date,
  },
  resetRequestId: {
  type: String,
  default: null,
},

passwordResetAt: {
  type: Date,
  default: null,
},

googleId:{
  type:String,
  unique:true,
  sparse:true

},

authProvider:{
  type:String,
  required:true
}
  
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;