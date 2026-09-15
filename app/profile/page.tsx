"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios/axiosInstance";

export default function Profile() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    isVerified: false,
    authProvider: "",
  });

  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState("");

  const router = useRouter();

  useEffect(() => {
    const getUserDetails = async () => {
      try {
        const response = await axiosInstance.get("/api/auth/me");

        const name = response.data.user.name.toString();
        const email = response.data.user.email.toString();
        const isVerified = response.data.user.isVerified;
        const authProvider = response.data.user.authProvider.toString();

        setUser({
          name,
          email,
          isVerified,
          authProvider,
        });

        const sessionResponse = await axiosInstance.get(
          "/api/auth/sessions"
        );

        setSessions(sessionResponse.data.sessions);
        setCurrentSessionId(sessionResponse.data.currentSessionId);
      } catch (error: any) {
        console.log("PROFILE CATCH:", error.response?.status);
        console.log("PROFILE ERROR:", error.message);

        if (error.response?.status === 401) {
          router.push("/login");
        }
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

  const onLogoutAll = async () => {
    try {
      await axios.post("/api/auth/logout-all");

      router.push("/login");
    } catch (error: any) {
      console.log("Logout failed:", error.message);
    }
  };

const onLogoutSession = async (sessionId: string) => {
  try {
    if (sessionId === currentSessionId) {
      await axios.post("/api/auth/logout");

      router.push("/login");
      return;
    }

    await axios.post("/api/auth/logout-session", {
      sessionId,
    });

    setSessions((prevSessions) =>
      prevSessions.filter(
        (session) => session.sessionId !== sessionId
      )
    );
  } catch (error: any) {
    console.log("Logout failed:", error.message);
  }
};
  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{user.name}</h1>

          {user.isVerified && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-black">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
              >
                <path d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z" />
              </svg>
            </span>
          )}
        </div>

        {user.authProvider === "google" ? (
          <Link
            href={"/set-password"}
            className="my-2 rounded-lg bg-green-500 px-5 py-2 font-semibold transition hover:bg-green-600"
          >
            Set Password
          </Link>
        ) : (
          <Link
            href={"/change-password"}
            className="my-2 rounded-lg bg-green-500 px-5 py-2 font-semibold transition hover:bg-green-600"
          >
            Change Password
          </Link>
        )}

        <button
          onClick={onLogout}
          type="button"
          className="rounded-lg bg-red-500 px-5 py-2 font-semibold transition hover:bg-red-600"
        >
          Logout
        </button>

        <button
          onClick={onLogoutAll}
          type="button"
          className="rounded-lg bg-red-500 px-5 py-2 font-semibold transition hover:bg-red-600"
        >
          Logout All
        </button>
      </nav>

      <main className="flex min-h-[80vh] flex-col items-center justify-center">
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
              {user.isVerified
                ? "✓ Email Verified"
                : "✕ Email Not Verified"}
            </p>
          </div>

          <p className="mt-4 text-gray-400">
            Your profile information will appear here.
          </p>
        </div>

        <div className="mt-10 w-full max-w-2xl">
          <h3 className="mb-4 text-2xl font-bold">
            Active Sessions
          </h3>

          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.sessionId}
                className="rounded-lg border border-gray-700 bg-[#1a1a1a] p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      Session
                    </p>

                    <p className="text-sm text-gray-400">
                      {session.sessionId}
                    </p>
                  </div>

                  {session.sessionId === currentSessionId && (
                    <span className="rounded-full bg-green-500 px-3 py-1 text-sm font-semibold text-black">
                      Current Session
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-gray-400">
                  Created:{" "}
                  {new Date(session.createdAt).toLocaleString()}
                </p>

                {session.lastUsedAt && (
                  <p className="text-sm text-gray-400">
                    Last used:{" "}
                    {new Date(session.lastUsedAt).toLocaleString()}
                  </p>
                )}

    <button
      onClick={() => onLogoutSession(session.sessionId)}
      type="button"
      className="rounded-lg bg-red-500 px-5 py-2 font-semibold transition hover:bg-red-600"
    >
      Logout this session
    </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}