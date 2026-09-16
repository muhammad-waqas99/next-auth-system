import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDisableChallenge extends Document {
  userId: mongoose.Types.ObjectId;
  challengeHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

const twoFactorDisableChallengeSchema= new Schema<IDisableChallenge>(
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

const DisableChallenge: Model<IDisableChallenge> =
  mongoose.models.DisableChallenge ||
  mongoose.model<IDisableChallenge>(
    "DisableChallenge",
    twoFactorDisableChallengeSchema
  );

export default DisableChallenge;