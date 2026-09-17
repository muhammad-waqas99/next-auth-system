"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function VerifyRegenerateBackupCodesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const challenge = searchParams.get("challenge");

  const [otp, setOtp] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyOtp = async () => {
    if (!challenge) {
      toast.error("Invalid regeneration challenge");
      return;
    }

    if (!otp) {
      toast.error("OTP is required");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be 6 digits");
      return;
    }

    try {
      setIsVerifying(true);

      const response = await axios.post("/api/auth/2fa/verify-regenerate", {
        challenge,
        otp,
      });

      if (response.data.success) {
        setBackupCodes(response.data.backupCodes || []);

        toast.success("Backup codes regenerated successfully");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again later.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = `Backup Codes\n\n${backupCodes.join("\n")}`;

    const blob = new Blob([content], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "backup-codes.txt";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-[#111111] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#181818] p-8">
        {!backupCodes.length ? (
          <>
            <h1 className="text-2xl font-bold text-center">
              Verify Authenticator Code
            </h1>

            <p className="mt-3 text-center text-sm text-zinc-400">
              Enter the 6-digit code from your authenticator app to regenerate
              your backup codes.
            </p>

            <div className="mt-6">
              <label htmlFor="otp" className="block text-sm text-zinc-300 mb-2">
                Authentication Code
              </label>

              <input
                type="text"
                id="otp"
                name="otp"
                value={otp}
                maxLength={6}
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-white tracking-widest text-center"
                disabled={isVerifying}
              />

              <button
                type="button"
                onClick={verifyOtp}
                disabled={isVerifying}
                className="mt-5 w-full rounded-lg bg-green-500 px-4 py-3 font-semibold transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isVerifying ? "Verifying..." : "Verify & Regenerate"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => router.push("/profile")}
              disabled={isVerifying}
              className="mt-4 w-full rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center">
              Backup Codes Regenerated
            </h1>

            <p className="mt-3 text-center text-sm text-zinc-400">
              Your old backup codes are no longer valid. Save these new codes
              somewhere safe.
            </p>

            <div className="mt-6 rounded-xl border border-zinc-700 bg-zinc-900 p-5">
              <div className="grid grid-cols-2 gap-3">
                {backupCodes.map((code) => (
                  <div
                    key={code}
                    className="rounded-lg bg-zinc-800 px-3 py-3 text-center font-mono tracking-wider"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300">
              <p className="font-semibold">Important</p>

              <p className="mt-1">
                These backup codes will only be shown now. Save or download them
                before leaving this page.
              </p>
            </div>

            <button
              type="button"
              onClick={downloadBackupCodes}
              className="mt-5 w-full rounded-lg bg-blue-500 px-4 py-3 font-semibold transition hover:bg-blue-600"
            >
              Download Backup Codes
            </button>

            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="mt-3 w-full rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800"
            >
              Continue to Profile
            </button>
          </>
        )}
      </div>
    </main>
  );
}
