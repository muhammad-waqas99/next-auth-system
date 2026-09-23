"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

import Input from "@/app/components/ui/Input/Input";
import FormField from "@/app/components/ui/FormField/FormField";
import Button from "@/app/components/ui/Button/Button";

import { backupLoginSchema } from "@/app/lib/validationSchema/auth.schema";
import { validateForm } from "@/app/lib/validationSchema/validateForm";
import { axiosInstance } from "@/app/lib/axios/axiosInstance";

export default function BackupDisableTwoFactorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const challenge = searchParams.get("challenge");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [backupCode, setBackupCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyDisable = async () => {
    if (isVerifying) return;

    setFormErrors({});

    const result = validateForm(backupLoginSchema, {
      challenge,
      backupCode,
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

  const useAuthenticatorCode = () => {
    if (!challenge) {
      toast.error("Invalid login challenge");
      return;
    }

    router.push(
      `/two-factor/verify-disable?challenge=${challenge}`
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
            Enter one of your backup codes to disable
            two-factor authentication
          </p>
        </div>

        <div className="flex flex-col gap-5">
          <FormField
            label="Backup code"
            id="backupCode"
            error={formErrors.backupCode}
          >
            <Input
              id="backupCode"
              name="backupCode"
              type="text"
              inputMode="numeric"
              placeholder="Enter backup code"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value)}
              error={!!formErrors.backupCode}
              disabled={isVerifying}
            />
          </FormField>

          <Button
            type="button"
            variant="primary"
            fullWidth
            loading={isVerifying}
            loadingText="Disabling"
            onClick={verifyDisable}
          >
            Disable 2FA
          </Button>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={useAuthenticatorCode}
            disabled={isVerifying}
          >
            Use Authenticator Code
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-secondary">
          Use your authenticator app instead if you have access
          to it.
        </p>
      </div>
    </main>
  );
}

