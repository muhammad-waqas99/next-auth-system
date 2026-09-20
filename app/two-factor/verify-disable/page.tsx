"use client";

import {

  verifyOtpSchema,
} from "@/app/lib/validationSchema/auth.schema";
import { validateForm } from "@/app/lib/validationSchema/validateForm";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function VerifyDisableTwoFactorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const challenge = searchParams.get("challenge");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyDisable = async () => {
    if (!challenge) {
      toast.error("Invalid disable challenge");
      return;
    }

    setFormErrors({});

    const result = validateForm(verifyOtpSchema , {
      challenge,
      otp,

    });

    if (!result.success) {
      setFormErrors(result.errors);
      return;
    }

    try {
      setIsVerifying(true);

      const response = await axios.post(
        "/api/auth/2fa/verify-disable",
result.data
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

  const useBackupCode = () => {
    if (!challenge) {
      toast.error("Invalid disable challenge");
      return;
    }

    router.push(
      `/two-factor/backup-disable?challenge=${challenge}`
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">
          Disable Two-Factor Authentication
        </h1>

        <p className="text-gray-500 mb-6">
          Enter the 6-digit code from your authenticator app.
        </p>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, ""))
          }
          placeholder="Enter 6-digit OTP"
          className="w-full border rounded-lg px-4 py-3 mb-1"
          disabled={isVerifying}
        />

        {formErrors.otp && (
          <p className="mt-1 mb-3 text-sm text-red-400">
            {formErrors.otp}
          </p>
        )}

        <button
          onClick={verifyDisable}
          disabled={isVerifying}
          className="w-full bg-black text-white rounded-lg py-3 disabled:opacity-50"
        >
          {isVerifying ? "Verifying..." : "Disable 2FA"}
        </button>

        <button
          onClick={useBackupCode}
          disabled={isVerifying}
          className="w-full border rounded-lg py-3 mt-3 disabled:opacity-50"
        >
          Use Backup Code
        </button>
      </div>
    </div>
  );
}