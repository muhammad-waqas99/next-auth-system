import mongoose, { Document, Model, Schema } from "mongoose";

export interface ILoginChallenge extends Document {
  userId: mongoose.Types.ObjectId;
  challengeHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

const loginChallengeSchema = new Schema<ILoginChallenge>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    challengeHash: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    usedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const LoginChallenge: Model<ILoginChallenge> =
  mongoose.models.LoginChallenge ||
  mongoose.model<ILoginChallenge>(
    "LoginChallenge",
    loginChallengeSchema
  );

export default LoginChallenge;