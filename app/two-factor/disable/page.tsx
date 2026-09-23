
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

export default function DisableTwoFactorPage() {
  const router = useRouter();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDisableSetup = async () => {
    if (isLoading) return;

    setFormErrors({});

    const result = validateForm(disableTwoFactorSchema, {password});

    if (!result.success) {
      setFormErrors(result.errors);
      return;
    }

    try {
      setIsLoading(true);

      const response = await axiosInstance.post(
        "/api/auth/2fa/disable",
        result.data
      );

      if (response.data.success) {
        toast.success("Password verified");

        const challenge = response.data.challenge;

        router.push(
          `/two-factor/verify-disable?challenge=${challenge}`
        );
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-110">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Disable two-factor authentication
          </h1>

          <p className="mt-2 text-sm text-secondary">
            Enter your current password to continue
          </p>
        </div>

        <div className="flex flex-col gap-5">
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
              disabled={isLoading}
              autoComplete="current-password"
            />
          </FormField>

          <Button
            type="button"
            variant="primary"
            fullWidth
            loading={isLoading}
            loadingText="Verifying"
            onClick={handleDisableSetup}
          >
            Continue
          </Button>
        </div>
      </div>
    </main>
  );
}
