"use client";

import axios from "axios";
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
              ✓
            </span>
          )}
        </div>

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