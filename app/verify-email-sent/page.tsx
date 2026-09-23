"use client";

import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type VerificationStatus = "loading" | "success" | "error";

export default function VerifyEmailSent() {
  const searchParams = useSearchParams();

  const [status, setStatus] =
    useState<VerificationStatus>("loading");

  const [message, setMessage] = useState(
    "Checking your verification status..."
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const verificationStatus = async () => {
      try {
        const email = searchParams.get("email");

        if (!email) {
          setStatus("error");
          setMessage("Email is missing.");
          return;
        }

        const response = await axios.post(
          "/api/auth/verification-status",
          {
            email,
          }
        );

        if (response.data.isVerified) {
          setStatus("success");
          setMessage(
            "Your email has been verified successfully!"
          );

          clearInterval(interval);
          return;
        }

        setStatus("error");
        setMessage(
          "Your email is not verified yet. Please check your inbox and click the verification link."
        );
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Something went wrong while checking your verification status."
        );
      }
    };

    verificationStatus();

    interval = setInterval(() => {
      verificationStatus();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-110">

        {/* Loading / Checking */}
        {status === "loading" && (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <div
              className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent"
              aria-hidden="true"
            />

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Check Your Email
            </h1>

            <p className="mt-2 text-sm text-secondary">
              We've sent a verification link to your email.
            </p>

            <p className="mt-3 text-sm text-muted">
              Checking your verification status...
            </p>
          </div>
        )}

        {/* Success */}
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
              Email Verified!
            </h1>

            <p className="mt-2 text-sm leading-6 text-secondary">
              {message}
            </p>

            <Link
              href="/login"
              className="mt-6 block w-full rounded-lg bg-foreground px-5 py-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-black/85"
            >
              Go to Login
            </Link>
          </div>
        )}

        {/* Error / Not Verified */}
        {status === "error" && (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning">
              <span
                className="text-xl font-semibold"
                aria-hidden="true"
              >
                !
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Check Your Email
            </h1>

            <p className="mt-2 text-sm leading-6 text-secondary">
              {message}
            </p>

            <p className="mt-4 text-sm text-muted">
              Didn't receive the email? Check your spam folder.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
