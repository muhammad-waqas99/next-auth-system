"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function BackupLoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const challenge = searchParams.get("challenge");

  const [backupCode, setBackupCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!challenge) {
      toast.error("Invalid login challenge");
      return;
    }

    if (!backupCode) {
      toast.error("Please enter your backup code");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post("/api/auth/2fa/backup-login", {
        challenge,
        backupCode,
      });

      if (response.data.success) {
        toast.success("Logged in successfully");
        router.push("/profile");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
  
    <div className="flex min-h-screen items-center justify-center bg-[#111] px-4">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-[#181818] p-6">
        <h1 className="text-2xl font-bold text-white">
          Use Backup Code
        </h1>

        <p className="mt-2 text-sm text-gray-400">
          Enter one of your unused backup codes to continue logging in.
        </p>

        <form onSubmit={handleSubmit} className="mt-6">
          <label
            htmlFor="backupCode"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Backup Code
          </label>

          <input
            id="backupCode"
            type="text"
            value={backupCode}
            onChange={(e) => setBackupCode(e.target.value)}
            placeholder="Enter backup code"
            className="w-full rounded-lg border border-gray-700 bg-[#111] px-4 py-3 text-white outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full rounded-lg bg-blue-500 px-4 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify Backup Code"}
          </button>
        </form>

        <button
          type="button"
          onClick={() =>
            router.push(`/two-factor/login?challenge=${challenge}`)
          }
          className="mt-4 w-full text-sm text-gray-400 transition hover:text-white"
        >
          Use Authenticator Code
        </button>
      </div>
    </div>

  );
}