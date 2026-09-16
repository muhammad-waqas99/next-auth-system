"use client";

import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function VerifyDisableTwoFactorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const challenge = searchParams.get("challenge");

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyDisable = async () => {
    if (!challenge) {
      toast.error("Invalid disable challenge");
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

      const response = await axios.post("/api/auth/2fa/verify-disable", {
        challenge,
        otp,
      });

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
          Enter the 6-digit code from your authenticator app.
        </p>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter 6-digit OTP"
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
      </div>
    </div>
  );
}