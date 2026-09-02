"use client";

import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

type ResetStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

export default function ResetPassword() {
  const searchParams = useSearchParams();

  const plainToken = searchParams.get("token");

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
    e: React.SyntheticEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setStatus("loading");
      setErrorMessage("");

      const response = await axios.post(
        "/api/auth/reset-password",
        {
          password: formDetails.password,
          confirmPassword:
            formDetails.confirmPassword,
          plainToken,
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

  if (!plainToken) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">

        <div className="text-center">

          <h1 className="text-2xl text-white mb-2">
            Invalid Reset Link
          </h1>

          <p className="text-zinc-400 mb-5">
            Password reset token is missing.
          </p>

          <Link
            href="/forget-password"
            className="text-white underline"
          >
            Request another reset link
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {status === "success" ? (

          <div className="p-8 rounded-2xl bg-zinc-950 border border-zinc-800 text-center">

            <div className="text-4xl mb-4">
              ✓
            </div>

            <h1 className="text-2xl font-semibold text-white mb-2">
              Password Changed
            </h1>

            <p className="text-sm text-zinc-400 mb-6">
              Your password has been reset successfully.
              You can now login using your new password.
            </p>

            <Link
              href="/login"
              className="block w-full py-3 rounded-lg bg-white text-black font-medium"
            >
              Go to Login
            </Link>

          </div>

        ) : (

          <form
            onSubmit={onSubmit}
            className="p-8 rounded-2xl border border-zinc-800 bg-zinc-950"
          >

            <h1 className="text-2xl font-semibold text-white mb-2">
              Reset Password
            </h1>

            <p className="text-sm text-zinc-400 mb-6">
              Enter your new password.
            </p>

            <label
              htmlFor="password"
              className="block text-sm text-zinc-300 mb-2"
            >
              New Password
            </label>

            <input
              type="password"
              id="password"
              placeholder="Enter your new password"
              name="password"
              onChange={onChange}
              className="w-full px-4 py-3 mb-5 rounded-lg bg-zinc-900 border border-zinc-800 text-white outline-none focus:border-white"
            />

            <label
              htmlFor="confirmPassword"
              className="block text-sm text-zinc-300 mb-2"
            >
              Confirm Password
            </label>

            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm password"
              name="confirmPassword"
              onChange={onChange}
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
              className="w-full mt-6 py-3 rounded-lg bg-white text-black font-medium disabled:opacity-50"
            >
              {status === "loading"
                ? "Resetting..."
                : "Reset Password"}
            </button>

          </form>

        )}

      </div>

    </main>
  );
}