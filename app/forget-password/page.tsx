"use client";

import axios from "axios";
import Link from "next/link";
import { useState } from "react";

type ResetStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

export default function ForgetPassword() {
  const [status, setStatus] =
    useState<ResetStatus>("idle");

  const [email, setEmail] = useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

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

      console.log(response.data);

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

        {status === "success" ? (

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

          </div>

        ) : (

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