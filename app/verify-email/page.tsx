"use client";

import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type VerificationStatus = "loading" | "success" | "error";

export default function VerifyEmail() {
  const searchParams = useSearchParams();

  const [status, setStatus] =
    useState<VerificationStatus>("loading");

  const [message, setMessage] = useState(
    "Verifying your email..."
  );

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          setStatus("error");
          setMessage("Verification token is missing.");
          return;
        }

        const response = await axios.post(
          "/api/auth/verify-email",
          {
            token,
          }
        );

        if (response.data.success) {
          setStatus("success");
          setMessage(
            "Email verified successfully!"
          );

          toast.success(response.data.message);
        } else {
          setStatus("error");
          setMessage(
            response.data.message ||
              "Email verification failed."
          );
        }
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          "Invalid or expired verification link.";

        setStatus("error");
        setMessage(message);

        toast.error(message);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-110">

        {/* Loading */}
        {status === "loading" && (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
            <div
              className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent"
              aria-hidden="true"
            />

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Verifying Your Email
            </h1>

            <p className="mt-2 text-sm text-secondary">
              Please wait while we verify your email
              address.
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

        {/* Error */}
        {status === "error" && (
          <div className="rounded-xl border border-border bg-surface p-8 text-center">
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
              Verification Failed
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
      </div>
    </main>
  );
}

