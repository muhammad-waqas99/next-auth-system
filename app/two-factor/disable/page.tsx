"use client";

import { disableTwoFactorSchema } from "@/app/lib/validationSchema/auth.schema";
import { validateForm } from "@/app/lib/validationSchema/validateForm";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function DisableTwoFactorPage() {
  const router = useRouter();
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDisableSetup = async () => {
setFormErrors({});

const result = validateForm(disableTwoFactorSchema, password);

if (!result.success) {
  setFormErrors(result.errors);
  return;
}


    try {
      setIsLoading(true);

      const response = await axios.post("/api/auth/2fa/disable", result.data);

      if (response.data.success) {
        toast.success("Password verified");

        const challenge = response.data.challenge;

        router.push(
          `/two-factor/verify-disable?challenge=${challenge}`
        );
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2">
          Disable Two-Factor Authentication
        </h1>

        <p className="text-gray-500 mb-6">
          Enter your current password to continue.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full border rounded-lg px-4 py-3 mb-4"
          disabled={isLoading}
        />
                    {formErrors.password && (
    <p className="mt-1 text-sm text-red-400">
      {formErrors.password}
    </p>
  )}
        <button
          onClick={handleDisableSetup}
          disabled={isLoading}
          className="w-full bg-black text-white rounded-lg py-3 disabled:opacity-50"
        >
          {isLoading ? "Verifying..." : "Continue"}
        </button>
      </div>
    </div>
  );
}