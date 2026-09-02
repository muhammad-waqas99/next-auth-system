"use client";

import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { resetPasswordSchema } from "../lib/validationSchema/auth.schema";

type ResetStatus =
  | "idle"
  | "loading"
  | "success"
  | "error";

export default function ResetPassword() {
   const [formErrors, setFormErrors] = useState<Record<string, string>>({});
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
        setFormErrors({})
          const fieldError: Record<string ,string>= {} 
          const result = resetPasswordSchema.safeParse(formDetails)
      
        if(!result.success){
                result.error.issues.forEach(issue =>{
            const field =issue.path[0] as string
            fieldError[field] = issue.message
            
          })
      
      
          setFormErrors(fieldError)
        
            return;
        }

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
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/></svg>
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
                                {formErrors.newPassword && (
    <p className="mt-1 text-sm text-red-400">
      {formErrors.newPassword}
    </p>
  )}
       

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
                                {formErrors.confirmPassword && (
    <p className="mt-1 text-sm text-red-400">
      {formErrors.confirmPassword}
    </p>
  )}
       

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