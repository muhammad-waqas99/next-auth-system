import mongoose, { Document, Model, Schema } from "mongoose";

export interface IRegenerateChallenge extends Document {
  userId: mongoose.Types.ObjectId;
  challengeHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

const RegenerateChallengeSchema = new Schema<IRegenerateChallenge>(
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

const RegenerateChallenge: Model<IRegenerateChallenge> =
  mongoose.models.RegenerateChallenge ||
  mongoose.model<IRegenerateChallenge>(
    "LoginChallenge",
    RegenerateChallengeSchema
  );

export default RegenerateChallenge;