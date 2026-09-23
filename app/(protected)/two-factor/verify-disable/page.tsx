
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
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-110">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Disable two-factor authentication
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
              className="text-center tracking-widest"
            />
          </FormField>

          <Button
            type="button"
            variant="primary"
            fullWidth
            loading={isVerifying}
            loadingText="Verifying"
            onClick={verifyDisable}
          >
            Disable 2FA
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
      </div>
    </main>
  );
}

