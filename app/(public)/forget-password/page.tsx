
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { forgotPasswordSchema } from "../../lib/validationSchema/auth.schema";
import { validateForm } from "../../lib/validationSchema/validateForm";


import Input from "../../components/ui/Input/Input";
import FormField from "../../components/ui/FormField/FormField";
import Button from "../../components/ui/Button/Button";
import axios from "axios";

type ResetStatus =
  | "idle"
  | "loading"
  | "success"
  | "reset"
  | "error";

export default function ForgetPassword() {
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [resetRequestId, setResetRequestId] =
    useState<string | null>(null);

  const [status, setStatus] =
    useState<ResetStatus>("idle");

  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!resetRequestId) return;

    const checkResetStatus = async () => {
      try {
        const response = await axios.get(
          `/api/auth/reset-password-status?resetRequestId=${resetRequestId}`
        );

        if (response.data.isReset) {
          setStatus("reset");
        }
      } catch (error: any) {
        console.log(
          "Reset status check failed:",
          error.message
        );
      }
    };

    checkResetStatus();

    const interval = setInterval(() => {
      checkResetStatus();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [resetRequestId]);

  const onSubmit = async (
    e: React.SubmitEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (status === "loading") return;

    setFormErrors({});
    setErrorMessage("");

    const result = validateForm(
      forgotPasswordSchema,
      { email }
    );

    if (!result.success) {
      setFormErrors(result.errors);
      return;
    }

    try {
      setStatus("loading");

      const response = await axios.post(
        "/api/auth/forget-password",
        result.data
      );

      setResetRequestId(
        response.data.resetRequestId
      );

      setStatus("success");
    } catch (error: any) {
      console.log(
        "Something Went Wrong!",
        error.message
      );

      setErrorMessage(
        error.response?.data?.message ||
          "Something went wrong"
      );

      setStatus("error");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-110">

        {/* Success: Email Sent */}
        {status === "success" && (
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
              Check Your Email
            </h1>

            <p className="mt-2 text-sm text-secondary">
              We've sent a password reset link to
            </p>

            <p className="mt-1 break-all font-medium text-foreground">
              {email}
            </p>

            <p className="mt-6 text-sm text-muted">
              The reset link will expire in 15 minutes.
            </p>

            <p className="mt-3 text-sm text-muted">
              Waiting for password reset...
            </p>
          </div>
        )}

        {/* Success: Password Reset */}
        {status === "reset" && (
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
              Password Reset Successfully
            </h1>

            <p className="mt-2 text-sm text-secondary">
              Your password has been changed successfully.
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
        )}

        {/* Forgot Password Form */}
        {(status === "idle" ||
          status === "loading" ||
          status === "error") && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Forgot Password?
              </h1>

              <p className="mt-2 text-sm text-secondary">
                Enter your email and we'll send you a
                password reset link.
              </p>
            </div>

            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-5"
            >
              <FormField
                label="Email"
                id="email"
                error={formErrors.email}
              >
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  error={!!formErrors.email}
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
                loadingText="Sending"
              >
                Send Password Reset Email
              </Button>

              <Link
                href="/login"
                className="text-center text-sm text-secondary transition-colors duration-150 hover:text-foreground"
              >
                ← Back to Login
              </Link>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

