
"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

type ResetStatus =
  | "idle"
  | "loading"
  | "success"
  | "reset"
  | "error";

export default function ForgetPassword() {
  const [resetRequestId, setResetRequestId] =
    useState<string | null>(null);

  const [status, setStatus] =
    useState<ResetStatus>("idle");

  const [email, setEmail] = useState("");

  const [errorMessage, setErrorMessage] =
    useState("");


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
    e: React.SyntheticEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setStatus("loading");
      setErrorMessage("");

      const response = await axios.post(
        "/api/auth/forget-password",
        {
          email,
        }
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
    <main className="min-h-screen bg-black flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {status === "success" && (

          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950 text-center">

            <div className="text-4xl mb-4">
              ✓
            </div>

            <h1 className="text-2xl font-semibold text-white mb-2">
              Check Your Email
            </h1>

            <p className="text-zinc-400 text-sm mb-2">
              We've sent a password reset link to
            </p>

            <p className="text-white mb-6">
              {email}
            </p>

            <p className="text-sm text-zinc-500">
              The reset link will expire in 15 minutes.
            </p>

            <p className="text-sm text-zinc-500 mt-3">
              Waiting for password reset...
            </p>

          </div>

        )}

        {status === "reset" && (

          <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950 text-center">

            <div className="text-4xl mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/></svg>
            </div>

            <h1 className="text-2xl font-semibold text-white mb-2">
              Password Reset Successfully
            </h1>

            <p className="text-sm text-zinc-400 mb-6">
              Your password has been changed successfully.
            </p>

            <Link
              href="/login"
              className="block w-full py-3 rounded-lg bg-white text-black font-medium"
            >
              Go to Login
            </Link>

          </div>

        )}

        {(status === "idle" ||
          status === "loading" ||
          status === "error") && (

          <form
            onSubmit={onSubmit}
            className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950"
          >

            <h1 className="text-2xl font-semibold text-white mb-2">
              Forgot Password?
            </h1>

            <p className="text-sm text-zinc-400 mb-6">
              Enter your email and we'll send you a
              password reset link.
            </p>

            <label
              htmlFor="email"
              className="block text-sm text-zinc-300 mb-2"
            >
              Email
            </label>

            <input
              type="email"
              id="email"
              name="email"
              value={email}
              placeholder="Enter your email"
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-white"
            />

            {status === "error" && (
              <p className="text-sm text-red-400 mt-3">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full mt-6 py-3 bg-white text-black rounded-lg font-medium disabled:opacity-50"
            >
              {status === "loading"
                ? "Sending..."
                : "Send Password Reset Email"}
            </button>

            <Link
              href="/login"
              className="block text-center text-sm text-zinc-400 hover:text-white mt-5"
            >
              ← Back to Login
            </Link>

          </form>
        )}

      </div>

    </main>
  );
}

