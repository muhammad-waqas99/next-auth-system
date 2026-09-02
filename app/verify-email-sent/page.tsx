"use client";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

type VerificationStatus = "loading" | "success" | "error";

export default function VerifyEmailSent() {
  const searchParam = useSearchParams();

  const [status, setStatus] =
    useState<VerificationStatus>("loading");

  const [message, setMessage] = useState(
    "Checking your verification status..."
  );

  useEffect(() => {
    const verificationStatus = async () => {
      try {
        const email = searchParam.get("email");

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
          setMessage("Your email has been verified successfully!");
          clearInterval(interval);
        } else {
          setStatus("error");
          setMessage(
            "Your email is not verified yet. Please check your inbox and click the verification link."
          );
        }
        
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "Something went wrong while checking your verification status."
        );
      }
    };
verificationStatus();
    const interval = setInterval(() => {
  verificationStatus();
}, 5000);

return () => {
  clearInterval(interval);
};

  

  }, [searchParam]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-black p-8 text-center shadow-2xl">

       
        {status === "loading" && (
          <>
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-gray-700 border-t-yellow-400" />

            <h1 className="text-3xl font-bold text-white">
              Check Your Email
            </h1>

            <p className="mt-3 text-gray-400">
              We&apos;ve sent a verification link to your email.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Checking your verification status...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
              <span className="text-3xl text-green-400">
                               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/></svg>
              </span>
            </div>

            <h1 className="text-3xl font-bold text-white">
              Email Verified!
            </h1>

            <p className="mt-3 text-gray-400">
              {message}
            </p>

            <Link
              href="/login"
              className="mt-6 inline-block w-full rounded-lg bg-yellow-400 py-3 font-bold text-black transition hover:bg-yellow-500"
            >
              Go to Login
            </Link>
          </>
        )}

    
        {status === "error" && (
          <>
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400/10">
              <span className="text-2xl text-yellow-400">
                !
              </span>
            </div>

            <h1 className="text-3xl font-bold text-white">
              Check Your Email
            </h1>

            <p className="mt-3 text-gray-400">
              {message}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Didn&apos;t receive the email? Check your spam folder.
            </p>
          </>
        )}

      </div>
    </div>
  );
}