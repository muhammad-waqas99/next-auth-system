
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Input from "@/app/components/ui/Input/Input";
import FormField from "@/app/components/ui/FormField/FormField";
import Button from "@/app/components/ui/Button/Button";

import { disableTwoFactorSchema } from "@/app/lib/validationSchema/auth.schema";
import { validateForm } from "@/app/lib/validationSchema/validateForm";
import { axiosInstance } from "@/app/lib/axios/axiosInstance";

export default function RegenerateBackupCodesPage() {
  const router = useRouter();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const verifyPassword = async (
    e: React.SubmitEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (isVerifying) return;

    setFormErrors({});

    const result = validateForm(disableTwoFactorSchema, {
      password,
    });

    if (!result.success) {
      setFormErrors(result.errors);
      return;
    }

    try {
      setIsVerifying(true);

      const response = await axiosInstance.post(
        "/api/auth/2fa/regenerate-password",
        result.data
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
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-110">
                        <button
          type="button"
          onClick={() => router.push("/profile")}
          disabled={isVerifying}
          className="mb-6 text-sm text-secondary transition-colors duration-150 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Go Back
        </button>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Regenerate backup codes
          </h1>

          <p className="mt-2 text-sm text-secondary">
            Enter your password to continue. You will be asked for
            your authenticator code on the next step.
          </p>
        </div>

        <form
          onSubmit={verifyPassword}
          className="flex flex-col gap-5"
        >
          <FormField
            label="Password"
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
              disabled={isVerifying}
              autoComplete="current-password"
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isVerifying}
            loadingText="Verifying"
          >
            Continue
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
        </form>
      </div>
    </main>
  );
}

