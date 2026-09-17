"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function RegenerateBackupCodesPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyPassword = async () => {
    if (!password) {
      toast.error("Password is required");
      return;
    }

    try {
      setIsVerifying(true);

      const response = await axios.post(
        "/api/auth/2fa/regenerate-password",
        { password }
      );

      if (response.data.success) {
        const challenge = response.data.challenge;

        toast.success("Password verified");

        router.push(
          `/two-factor/verify-regenerate?challenge=${challenge}`
        );
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
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h1 className="text-2xl font-semibold text-white">
            Regenerate Backup Codes
          </h1>

          <p className="text-sm text-zinc-400 mt-2">
            Enter your password to continue. You will be asked for your
            authenticator code on the next step.
          </p>

          <div className="mt-6">
            <label
              htmlFor="password"
              className="block text-sm text-zinc-300 mb-2"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3 text-white outline-none focus:border-zinc-500"
              disabled={isVerifying}
            />
          </div>

          <button
            type="button"
            onClick={verifyPassword}
            disabled={isVerifying}
            className="w-full mt-5 rounded-lg bg-white text-black py-3 font-medium disabled:opacity-50"
          >
            {isVerifying ? "Verifying..." : "Continue"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/profile")}
            disabled={isVerifying}
            className="w-full mt-3 rounded-lg border border-zinc-700 text-zinc-300 py-3 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}