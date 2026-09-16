import mongoose, { Document, Model, Schema } from "mongoose";

export interface IBackupCode extends Document {
  userId: mongoose.Types.ObjectId;

  codes: {
    codeHash: string;
    usedAt: Date | null;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const backupCodeSchema = new Schema<IBackupCode>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    codes: [
      {
        codeHash: {
          type: String,
          required: true,
        },

        usedAt: {
          type: Date,
          default: null,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const BackupCode: Model<IBackupCode> =
  mongoose.models.BackupCode ||
  mongoose.model<IBackupCode>("BackupCode", backupCodeSchema);

export default BackupCode;