"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import Input from "@/app/components/ui/Input/Input";
import FormField from "@/app/components/ui/FormField/FormField";
import Button from "@/app/components/ui/Button/Button";

import { validateForm } from "@/app/lib/validationSchema/validateForm";
import { backupLoginSchema } from "@/app/lib/validationSchema/auth.schema";

import axios from "axios";

export default function BackupLoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const challenge = searchParams.get("challenge");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [backupCode, setBackupCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

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
      setLoading(true);

      const response = await axios.post(
        "/api/auth/2fa/backup-login",
        result.data
      );

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

  const useAuthenticatorCode = () => {
    router.push(`/two-factor/login?challenge=${challenge}`);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-110">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Use backup code
          </h1>

          <p className="mt-2 text-sm text-secondary">
            Enter one of your unused backup codes to continue
            logging in
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
              disabled={loading}
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            loadingText="Verifying"
          >
            Verify Backup Code
          </Button>
        </form>

        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={useAuthenticatorCode}
          disabled={loading}
          className="mt-5"
        >
          Use Authenticator Code
        </Button>
      </div>
    </main>
  );
}
