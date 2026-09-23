
"use client";

import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { resetPasswordSchema } from "../lib/validationSchema/auth.schema";
import { validateForm } from "../lib/validationSchema/validateForm";

import Input from "../components/ui/Input/Input";
import FormField from "../components/ui/FormField/FormField";
import Button from "../components/ui/Button/Button";

type ResetStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

export default function ResetPassword() {
  const searchParams = useSearchParams();

  const plainToken = searchParams.get("token");

  const [formErrors, setFormErrors] = useState<Record<string, string>>(
    {}
  );

  const [status, setStatus] =
    useState<ResetStatus>("idle");

  const [errorMessage, setErrorMessage] =
    useState("");

  const [formDetails, setFormDetails] = useState({
    password: "",
    confirmPassword: "",
  });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormDetails({
      ...formDetails,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (
    e: React.SubmitEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (status === "loading") return;

    setFormErrors({});
    setErrorMessage("");

    const result = validateForm(
      resetPasswordSchema,
      {
        ...formDetails,
        plainToken,
      }
    );

    if (!result.success) {
      setFormErrors(result.errors);
      return;
    }

    try {
      setStatus("loading");

      const response = await axios.post(
        "/api/auth/reset-password",
        {
          password: result.data.password,
          confirmPassword: result.data.confirmPassword,
          plainToken: result.data.plainToken,
        }
      );

      toast.success(response.data.message);

      setStatus("success");
    } catch (error: any) {
      console.log(
        "Something Went Wrong!",
        error.message
      );

      const message =
        error.response?.data?.message ||
        "Something went wrong";

      toast.error(message);
      setErrorMessage(message);

      setStatus("error");
    }
  };

  if (!plainToken) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-110 text-center">
          <div className="rounded-xl border border-border bg-surface p-8">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Invalid Reset Link
            </h1>

            <p className="mt-2 text-sm text-secondary">
              Password reset token is missing.
            </p>

            <Link
              href="/forget-password"
              className="mt-6 inline-block text-sm font-medium text-foreground underline underline-offset-4 transition-opacity duration-150 hover:opacity-70"
            >
              Request another reset link
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-110">

        {status === "success" ? (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m5 12 4 4L19 6"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Password Changed
            </h1>

            <p className="mt-2 text-sm leading-6 text-secondary">
              Your password has been reset successfully.
              You can now login using your new password.
            </p>

            <div className="mt-6">
              <Link href="/login">
                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                >
                  Go to Login
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Reset Password
              </h1>

              <p className="mt-2 text-sm text-secondary">
                Enter your new password.
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-5"
            >
              <FormField
                label="New Password"
                id="password"
                error={formErrors.password}
              >
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter your new password"
                  value={formDetails.password}
                  onChange={onChange}
                  error={!!formErrors.password}
                  disabled={status === "loading"}
                />
              </FormField>

              <FormField
                label="Confirm Password"
                id="confirmPassword"
                error={formErrors.confirmPassword}
              >
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  value={formDetails.confirmPassword}
                  onChange={onChange}
                  error={!!formErrors.confirmPassword}
                  disabled={status === "loading"}
                />
              </FormField>

              {status === "error" && (
                <p className="text-sm text-error">
                  {errorMessage}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={status === "loading"}
                loadingText="Resetting"
              >
                Reset Password
              </Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

