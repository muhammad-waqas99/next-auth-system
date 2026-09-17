"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function BackupDisableTwoFactorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const challenge = searchParams.get("challenge");

  const [backupCode, setBackupCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyDisable = async () => {
    if (!challenge) {
      toast.error("Invalid disable challenge");
      return;
    }

    if (!backupCode) {
      toast.error("Backup code is required");
      return;
    }

    try {
      setIsVerifying(true);

      const response = await axios.post(
        "/api/auth/2fa/verify-disable",
        {
          challenge,
          backupCode,
        }
      );

      if (response.data.success) {
        toast.success("2FA disabled successfully");
        router.push("/profile");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again later."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">
          Disable Two-Factor Authentication
        </h1>

        <p className="text-gray-500 mb-6">
          Enter one of your backup codes to disable
          two-factor authentication.
        </p>

        <input
          type="text"
          inputMode="numeric"
          value={backupCode}
          onChange={(e) => setBackupCode(e.target.value)}
          placeholder="Enter backup code"
          className="w-full border rounded-lg px-4 py-3 mb-4"
          disabled={isVerifying}
        />

        <button
          onClick={verifyDisable}
          disabled={isVerifying}
          className="w-full bg-black text-white rounded-lg py-3 disabled:opacity-50"
        >
          {isVerifying ? "Verifying..." : "Disable 2FA"}
        </button>

        <button
          onClick={() =>
            router.push(
              `/two-factor/verify-disable?challenge=${challenge}`
            )
          }
          disabled={isVerifying}
          className="w-full border rounded-lg py-3 mt-3 disabled:opacity-50"
        >
          Use Authenticator Code
        </button>
      </div>
    </div>
  );
}