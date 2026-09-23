
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Input from "@/app/components/ui/Input/Input";
import FormField from "@/app/components/ui/FormField/FormField";
import Button from "@/app/components/ui/Button/Button";

import {
  setupTwoFactorSchema,
  verifySetupSchema,
} from "@/app/lib/validationSchema/auth.schema";
import { validateForm } from "@/app/lib/validationSchema/validateForm";
import { axiosInstance } from "@/app/lib/axios/axiosInstance";

export default function TwoFactorSetup() {
  const router = useRouter();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [qrImg, setQrImg] = useState("");
  const [otpSecret, setOtpSecret] = useState("");

  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const startSetup = async (
    e: React.SyntheticEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (isSettingUp) return;

    setFormErrors({});

    const result = validateForm(setupTwoFactorSchema, {
      password,
    });

    if (!result.success) {
      setFormErrors(result.errors);
      return;
    }

    try {
      setIsSettingUp(true);

      const response = await axiosInstance.post(
        "/api/auth/2fa/setup",
        result.data
      );

      setQrImg(response.data.qrCode);
      setOtpSecret(response.data.secret);

      toast.success("Password verified. Scan the QR code.");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Unable to start 2FA setup"
      );
    } finally {
      setIsSettingUp(false);
    }
  };

  const verifySetup = async (
    e: React.SyntheticEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (isVerifying) return;

    setFormErrors({});

    const result = validateForm(verifySetupSchema, {
      otp,
      otpSecret,
    });

    if (!result.success) {
      setFormErrors(result.errors);
      return;
    }

    try {
      setIsVerifying(true);

      const response = await axiosInstance.post(
        "/api/auth/2fa/verify-setup",
        result.data
      );

      if (response.data.success) {
        setBackupCodes(response.data.backupCodes || []);

        toast.success("2FA enabled successfully");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "2FA verification failed"
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

  const isBusy = isSettingUp || isVerifying;

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-110">
        {!backupCodes.length ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Enable two-factor authentication
              </h1>

              <p className="mt-2 text-sm text-secondary">
                Add an extra layer of security to your account
              </p>
            </div>

            {!qrImg ? (
              <>
                <p className="mb-6 text-center text-sm text-secondary">
                  Enter your current password to start setting up
                  two-factor authentication.
                </p>

                <form
                  onSubmit={startSetup}
                  className="flex flex-col gap-5"
                >
                  <FormField
                    label="Current password"
                    id="password"
                    error={formErrors.password}
                  >
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={!!formErrors.password}
                      disabled={isSettingUp}
                      autoComplete="current-password"
                    />
                  </FormField>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={isSettingUp}
                    loadingText="Verifying"
                  >
                    Continue
                  </Button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <p className="text-sm text-secondary">
                    Scan this QR code using Google Authenticator or
                    another authenticator app.
                  </p>
                </div>

                <div className="flex justify-center rounded-lg border border-border bg-surface p-5">
                  <img
                    src={qrImg}
                    alt="2FA QR Code"
                    className="h-56 w-56"
                  />
                </div>

                <p className="mt-5 text-center text-sm text-secondary">
                  After scanning the QR code, enter the 6-digit code
                  generated by your authenticator app.
                </p>

                <form
                  onSubmit={verifySetup}
                  className="mt-6 flex flex-col gap-5"
                >
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
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={isVerifying}
                    loadingText="Verifying"
                  >
                    Verify & Enable 2FA
                  </Button>
                </form>
              </>
            )}

            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => router.push("/profile")}
              disabled={isBusy}
              className="mt-4"
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                2FA enabled successfully
              </h1>

              <p className="mt-2 text-sm text-secondary">
                Save these backup codes somewhere safe. Each code
                can only be used once.
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

