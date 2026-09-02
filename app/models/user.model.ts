import mongoose from "mongoose";


interface IUser {
  name: string;
  email: string;
  password: string;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  isVerified:boolean;
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
    required: true,
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
  
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;