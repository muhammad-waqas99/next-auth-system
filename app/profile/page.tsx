"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    isVerified: false,
  });

  const router = useRouter();

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const response = await axios.get("/api/auth/me");

        const name = response.data.user.name.toString();
        const email = response.data.user.email.toString();
        const isVerified = response.data.user.isVerified;

        setUser({
          name,
          email,
          isVerified,
        });
      } catch (error) {
        console.log("Something went wrong");
      }
    };

    getUserDetails();
  }, []);

  const onLogout = async () => {
    try {
      await axios.post("/api/auth/logout");

      router.push("/login");
    } catch (error: any) {
      console.log("Logout failed:", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">
            {user.name}
          </h1>

          {user.isVerified && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-black">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"/></svg>
            </span>
          )}
        </div>

                <Link href={"/change-password"}
                  
        
          className="rounded-lg bg-green-500 my-2 px-5 py-2 font-semibold transition hover:bg-green-600">
          Change Password
        </Link>

        <button
          onClick={onLogout}
          type="button"
          className="rounded-lg bg-red-500 px-5 py-2 font-semibold transition hover:bg-red-600"
        >
          Logout
        </button>

      </nav>

      <main className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold">
            Welcome to your profile
          </h2>

          <div className="mt-5 space-y-2">
            <p className="text-gray-300">
              <span className="font-semibold">Name:</span>{" "}
              {user.name}
            </p>

            <p className="text-gray-300">
              <span className="font-semibold">Email:</span>{" "}
              {user.email}
            </p>

            <p
              className={
                user.isVerified
                  ? "font-semibold text-green-400"
                  : "font-semibold text-red-400"
              }
            >
              {user.isVerified ? "✓ Email Verified" : "✕ Email Not Verified"}
            </p>
          </div>

          <p className="mt-4 text-gray-400">
            Your profile information will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}