
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import Input from "@/app/components/ui/Input/Input";
import FormField from "@/app/components/ui/FormField/FormField";
import Button from "@/app/components/ui/Button/Button";

import { verifyOtpSchema } from "@/app/lib/validationSchema/auth.schema";
import { validateForm } from "@/app/lib/validationSchema/validateForm";
import { axiosInstance } from "@/app/lib/axios/axiosInstance";

export default function TwoFactorLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const challenge = searchParams.get("challenge");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyLogin = async () => {
    if (isVerifying) return;

    setFormErrors({});

    const result = validateForm(verifyOtpSchema, {
      challenge,
      otp,
    });

    if (!result.success) {
      setFormErrors(result.errors);
      return;
    }

    try {
      setIsVerifying(true);

      const response = await axiosInstance.post(
        "/api/auth/2fa/verify-login",
        result.data
      );

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
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-110">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Two-factor authentication
          </h1>

          <p className="mt-2 text-sm text-secondary">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <FormField
            label="Authentication code"
            id="otp"
            error={formErrors.otp}
          >
            <Input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              error={!!formErrors.otp}
              disabled={isVerifying}
            />
          </FormField>

          <Button
            type="button"
            variant="primary"
            fullWidth
            loading={isVerifying}
            loadingText="Verifying"
            onClick={verifyLogin}
          >
            Verify & Login
          </Button>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={useBackupCode}
            disabled={isVerifying}
          >
            Use Backup Code
          </Button>
        </div>

        <button
          type="button"
          onClick={() => router.push("/login")}
          disabled={isVerifying}
          className="mt-6 block w-full text-center text-sm text-secondary transition-colors duration-150 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back to Login
        </button>
      </div>
    </main>
  );
}

