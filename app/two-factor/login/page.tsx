"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function TwoFactorLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const challenge = searchParams.get("challenge");

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyLogin = async () => {
    if (!challenge) {
      toast.error("Invalid login challenge");
      return;
    }

    if (!otp) {
      toast.error("Please enter your OTP");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      toast.error("OTP must be 6 digits");
      return;
    }

    try {
      setIsVerifying(true);

      const response = await axios.post("/api/auth/2fa/verify-login", {
        challenge,
        otp,
      });

      if (response.data.success) {
        toast.success(response.data.message);
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

  const useBackupCode = () => {
    if (!challenge) {
      toast.error("Invalid login challenge");
      return;
    }

    router.push(`/two-factor/backup-login?challenge=${challenge}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border p-6 shadow-lg">
          <h1 className="text-2xl font-semibold text-center">
            Two-Factor Authentication
          </h1>

          <p className="mt-2 text-center text-sm text-gray-500">
            Enter the 6-digit code from your authenticator app.
          </p>

          <div className="mt-6">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              placeholder="Enter 6-digit OTP"
              className="w-full rounded-lg border px-4 py-3 outline-none"
              disabled={isVerifying}
            />
          </div>

          <button
            onClick={verifyLogin}
            type="button"
            disabled={isVerifying}
            className="mt-4 w-full rounded-lg px-4 py-3 font-medium disabled:opacity-50"
          >
            {isVerifying ? "Verifying..." : "Verify & Login"}
          </button>

          <button
            onClick={useBackupCode}
            type="button"
            disabled={isVerifying}
            className="mt-3 w-full text-sm disabled:opacity-50"
          >
            Use Backup Code
          </button>

          <button
            onClick={() => router.push("/login")}
            type="button"
            disabled={isVerifying}
            className="mt-3 w-full text-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}