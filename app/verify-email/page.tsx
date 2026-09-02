"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type VerificationStatus = "loading" | "success" | "error";

export default function VerifyEmail() {
  const searchParams = useSearchParams();

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          setStatus("error");
          setMessage("Verification token is missing.");
          return;
        }

        const response = await axios.post("/api/auth/verify-email", {
          token,
        });
           
        if (response.data.success) {
          setStatus("success");
          setMessage("Email verified successfully!");
          toast.success(response.data.message);
        } else {
          setStatus("error");
          setMessage(
            response.data.message || "Email verification failed."
          );
        }
      } catch (error:any) {
        toast.error(
  error.response?.data?.message ||
    "Something went wrong"
);
        if (axios.isAxiosError(error)) {
          setStatus("error");
          setMessage(
            error.response?.data?.message ||
              "Invalid or expired verification link."
          );

        } else {
          setStatus("error");
          setMessage("Something went wrong.");
        }
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {status === "loading" && (
          <>
            <h1 className="text-2xl font-bold text-white">
              Verifying your email...
            </h1>

            <p className="mt-2 text-gray-400">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-2xl font-bold text-green-400">
              Email Verified!
            </h1>

            <p className="mt-2 text-gray-400">{message}</p>

            <a
              href="/login"
              className="mt-5 inline-block rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-black hover:bg-yellow-500"
            >
              Go to Login
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-2xl font-bold text-red-400">
              Verification Failed
            </h1>

            <p className="mt-2 text-gray-400">{message}</p>

            <a
              href="/login"
              className="mt-5 inline-block rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-black hover:bg-yellow-500"
            >
              Go to Login
            </a>
          </>
        )}
      </div>
    </div>
  );
}