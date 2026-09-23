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

export default function VerifyRegenerateBackupCodesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const challenge = searchParams.get("challenge");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [otp, setOtp] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyOtp = async () => {
    if (!challenge) {
      toast.error("Invalid regeneration challenge");
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
        "/api/auth/2fa/verify-regenerate",
        result.data
      );

      if (response.data.success) {
        setBackupCodes(response.data.backupCodes || []);

        toast.success("Backup codes regenerated successfully");
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
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-110">
        {!backupCodes.length ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Verify authenticator code
              </h1>

              <p className="mt-2 text-sm text-secondary">
                Enter the 6-digit code from your authenticator app
                to regenerate your backup codes
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
                  value={otp}
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
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
                onClick={verifyOtp}
              >
                Verify & Regenerate
              </Button>

              <Button
                type="button"
                variant="secondary"
                fullWidth
                onClick={() => router.push("/profile")}
                disabled={isVerifying}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Backup codes regenerated
              </h1>

              <p className="mt-2 text-sm text-secondary">
                Your old backup codes are no longer valid. Save
                these new codes somewhere safe.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-surface p-5">
              <div className="grid grid-cols-2 gap-3">
                {backupCodes.map((code) => (
                  <div
                    key={code}
                    className="rounded-lg border border-border bg-background px-3 py-3 text-center font-mono text-sm tracking-wider"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm">
              <p className="font-semibold text-warning">Important</p>

              <p className="mt-1 text-secondary">
                These backup codes will only be shown now. Save or
                download them before leaving this page.
              </p>
            </div>

            <Button
              type="button"
              variant="accent"
              fullWidth
              onClick={downloadBackupCodes}
              className="mt-5"
            >
              Download Backup Codes
            </Button>

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => router.push("/profile")}
              className="mt-3"
            >
              Continue to Profile
            </Button>
          </>
        )}
      </div>
    </main>
  );
}

