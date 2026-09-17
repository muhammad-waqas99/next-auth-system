import BackupCode from "@/app/models/backupCode.model";
import crypto from "crypto";

export async function consumeBackupCode(
  userId: string,
  backupCode: string
) {
  const backupCodeHash = crypto
    .createHash("sha256")
    .update(backupCode)
    .digest("hex");

  const result = await BackupCode.updateOne(
    {
      userId,
      codes: {
        $elemMatch: {
          codeHash: backupCodeHash,
          usedAt: null,
        },
      },
    },
    {
      $set: {
        "codes.$.usedAt": new Date(),
      },
    }
  );

  return result.modifiedCount === 1;
}