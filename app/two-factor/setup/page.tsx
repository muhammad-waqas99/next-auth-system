"use client";

import {
  setupTwoFactorSchema,
  verifySetupSchema,
} from "@/app/lib/validationSchema/auth.schema";
import { validateForm } from "@/app/lib/validationSchema/validateForm";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

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

      const response = await axios.post(
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

      const response = await axios.post(
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

  return (
    <main className="min-h-screen bg-[#111111] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#181818] p-8">
        {!backupCodes.length ? (
          <>
            <h1 className="text-2xl font-bold text-center">
              Enable Two-Factor Authentication
            </h1>

            {!qrImg ? (
              <>
                <p className="mt-3 text-center text-sm text-zinc-400">
                  Enter your current password to start setting up
                  two-factor authentication.
                </p>

                <form onSubmit={startSetup} className="mt-8">
                  <label
                    htmlFor="password"
                    className="block text-sm text-zinc-300 mb-2"
                  >
                    Password
                  </label>

                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={password}
                    placeholder="Enter your password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-white"
                    disabled={isSettingUp}
                  />

                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-400">
                      {formErrors.password}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isSettingUp}
                    className="mt-5 w-full rounded-lg bg-blue-500 px-4 py-3 font-semibold transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSettingUp
                      ? "Verifying password..."
                      : "Continue"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <p className="mt-3 text-center text-sm text-zinc-400">
                  Scan this QR code using Google Authenticator or
                  another authenticator app.
                </p>

                <div className="mt-6 flex justify-center rounded-xl bg-white p-5">
                  <img
                    src={qrImg}
                    alt="2FA QR Code"
                    className="h-56 w-56"
                  />
                </div>

                <p className="mt-5 text-center text-sm text-zinc-400">
                  After scanning the QR code, enter the 6-digit code
                  generated by your authenticator app.
                </p>

                <form onSubmit={verifySetup} className="mt-6">
                  <label
                    htmlFor="otp"
                    className="block text-sm text-zinc-300 mb-2"
                  >
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
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, ""))
                    }
                    className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-white tracking-widest text-center"
                    disabled={isVerifying}
                  />

                  {formErrors.otp && (
                    <p className="mt-1 text-sm text-red-400">
                      {formErrors.otp}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="mt-5 w-full rounded-lg bg-green-500 px-4 py-3 font-semibold transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isVerifying
                      ? "Verifying..."
                      : "Verify & Enable 2FA"}
                  </button>
                </form>
              </>
            )}

            <button
              type="button"
              onClick={() => router.push("/profile")}
              disabled={isSettingUp || isVerifying}
              className="mt-4 w-full rounded-lg border border-zinc-700 px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center">
              2FA Enabled Successfully
            </h1>

            <p className="mt-3 text-center text-sm text-zinc-400">
              Save these backup codes somewhere safe. Each code can
              only be used once.
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
                These backup codes will only be shown now. Save or
                download them before leaving this page.
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