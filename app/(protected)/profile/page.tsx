
"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Check,
  Clock3,
  KeyRound,
  Laptop,
  LogOut,
  Mail,
  MonitorSmartphone,
  ShieldCheck,
  User,
} from "lucide-react";

import { axiosInstance } from "@/app/lib/axios/axiosInstance";
import { useAuthStore } from "@/app/store/auth/authStore";

import ProfileSkeleton from "./components/ProfileSkeleton";
import ThemeSelector from "@/app/components/ui/ThemeSelector/ThemeSelector";
import Button from "@/app/components/ui/Button/Button";
import Modal from "@/app/components/ui/Modal/Modal";

export default function Profile() {
  const router = useRouter();
const [currentLogoutModal, setCurrentLogoutModal] = useState(false);
const [sessionLogoutModal, setSessionLogoutModal] = useState(false);
const [allLogoutModal, setAllLogoutModal] = useState(false);
const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const backupCodesRemaining = useAuthStore(
    (state) => state.backupCodesRemaining
  );
  const clearUser = useAuthStore((state) => state.clearUser);

  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState("");

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days < 30) return `${days} days ago`;

    return new Date(date).toLocaleDateString();
  };

  useEffect(() => {
    const getSessions = async () => {
      try {
        const response = await axiosInstance.get(
          "/api/auth/sessions"
        );

        setSessions(response.data.sessions);
        setCurrentSessionId(response.data.currentSessionId);
      } catch (error: any) {
        console.log(
          "PROFILE CATCH:",
          error.response?.status
        );
        console.log("PROFILE ERROR:", error.message);

        if (error.response?.status === 401) {
          router.push("/login");
        }
      }
    };

    getSessions();
  }, [router]);


  const onLogout = async () => {
    try {
      await axios.post("/api/auth/logout");

      clearUser();
      router.push("/login");
    } catch (error: any) {
      console.log("Logout failed:", error.message);
    }
  };

  // Logout all sessions.
  const onLogoutAll = async () => {
    try {
      await axios.post("/api/auth/logout-all");

      clearUser();
      router.push("/login");
    } catch (error: any) {
      console.log("Logout failed:", error.message);
    }
  };

  // Logout a specific session.

  const onLogoutSession = async (sessionId: string) => {
    try {
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

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <ProfileSkeleton />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const isGoogleOnly =
    user.authMethods.includes("google") &&
    !user.authMethods.includes("email");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 lg:py-14">

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Profile
          </h1>

          <p className="mt-2 text-base text-secondary">
            Manage your account and security settings.
          </p>
        </header>

        {/* Personal Information + Appearance */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">

          {/* Personal Information */}
          <section className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 sm:p-7">
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border">
                  <User size={18} />
                </div>

                <h2 className="text-xl font-semibold">
                  Personal information
                </h2>
              </div>

              <p className="mt-3 text-sm text-secondary">
                Your basic account information.
              </p>
            </div>

            <div className="flex flex-1 flex-col gap-8">

              {/* Name */}
              <div className="flex items-start gap-3">
                <User
                  size={18}
                  className="mt-0.5 shrink-0 text-muted"
                />

                <div>
                  <p className="text-sm font-medium text-secondary">
                    Name
                  </p>

                  <p className="mt-1 text-base font-medium">
                    {user.name}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <Mail
                  size={18}
                  className="mt-0.5 shrink-0 text-muted"
                />

                <div>
                  <p className="text-sm font-medium text-secondary">
                    Email
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-base font-medium">
                      {user.email}
                    </p>

                    {user.isVerified && (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
                        <Check size={15} />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Authentication Methods */}
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-muted"
                />

                <div>
                  <p className="text-sm font-medium text-secondary">
                    Authentication methods
                  </p>

                  <p className="mt-1 text-base font-medium">
                    {user.authMethods
                      .map((method) =>
                        method === "email"
                          ? "Email"
                          : "Google"
                      )
                      .join(" + ")}
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* Appearance */}
          <section className="flex h-full flex-col rounded-xl border border-border bg-surface p-6 sm:p-7">
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border">
                  <MonitorSmartphone size={18} />
                </div>

                <h2 className="text-xl font-semibold">
                  Appearance
                </h2>
              </div>

              <p className="mt-3 text-sm text-secondary">
                Customize how the application looks.
              </p>
            </div>

            <div className="flex flex-1 flex-col justify-between">

              {/* Theme */}
              <div className="flex items-start gap-3">
                <MonitorSmartphone
                  size={18}
                  className="mt-0.5 shrink-0 text-muted"
                />

                <div className="min-w-0">
                  <p className="text-sm font-medium text-secondary">
                    Theme
                  </p>

                  <p className="mt-1 text-base font-medium">
                    Choose your preferred appearance.
                  </p>

                  <div className="mt-4">
                    <ThemeSelector />
                  </div>
                </div>
              </div>

              {/* Theme persistence */}
              <div className="mt-10 flex items-start gap-3 border-t border-border pt-6">
                <Check
                  size={17}
                  className="mt-0.5 shrink-0 text-success"
                />

                <p className="text-sm text-secondary">
                  Your theme preference is saved automatically
                  and will be remembered on your next visit.
                </p>
              </div>

            </div>
          </section>

        </div>

        {/* Security */}
        <section className="mt-10">
          <div className="mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border">
                <ShieldCheck size={18} />
              </div>

              <h2 className="text-2xl font-semibold">
                Security
              </h2>
            </div>

            <p className="mt-3 text-sm text-secondary">
              Manage your password and account security.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface">

            {/* Password */}
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border">
                  <KeyRound size={17} />
                </div>

                <div>
                  <h3 className="text-base font-medium">
                    Password
                  </h3>

                  <p className="mt-1 text-sm text-secondary">
                    Manage your account password.
                  </p>
                </div>
              </div>

              <Button
                variant="accent"
                onClick={() =>
                  router.push(
                    isGoogleOnly
                      ? "/set-password"
                      : "/change-password"
                  )
                }
              >
                {isGoogleOnly
                  ? "Set Password"
                  : "Change Password"}
              </Button>
            </div>

            <div className="border-t border-border" />

            {/* Two Factor */}
            <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border">
                  <ShieldCheck size={17} />
                </div>

                <div>
                  <h3 className="text-base font-medium">
                    Two-factor authentication
                  </h3>

                  <p className="mt-1 text-sm text-secondary">
                    {user.twoFactorEnabled
                      ? "Your account is protected with two-factor authentication."
                      : "Add an extra layer of security to your account."}
                  </p>
                </div>
              </div>

              <Button
                variant={user.twoFactorEnabled ? "danger" : "warning"}
                onClick={() =>
                  router.push(
                    user.twoFactorEnabled
                      ? "/two-factor/disable"
                      : "/two-factor/setup"
                  )
                }
              >
                {user.twoFactorEnabled
                  ? "Disable 2FA"
                  : "Enable 2FA"}
              </Button>
            </div>

            {/* Backup Codes */}
            {user.twoFactorEnabled && (
              <>
                <div className="border-t border-border" />

                <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border">
                      <KeyRound size={17} />
                    </div>

                    <div>
                      <h3 className="text-base font-medium">
                        Backup codes
                      </h3>

                      <p className="mt-1 text-sm text-secondary">
                        {backupCodesRemaining} remaining
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="warning"
                    onClick={() =>
                      router.push(
                        "/two-factor/regenerate-password"
                      )
                    }
                  >
                    Regenerate
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Active Sessions */}

<section className="mt-10">
  <div className="mb-5">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border">
        <Laptop size={18} />
      </div>

      <h2 className="text-2xl font-semibold">
        Active sessions
      </h2>
    </div>

    <p className="mt-3 text-sm text-secondary">
      Manage the devices currently signed in to your account.
    </p>
  </div>

  <div className="overflow-hidden rounded-xl border border-border bg-surface">
    {sessions.map((session) => {
      const isCurrent =
        session.sessionId === currentSessionId;

      return (
        <div
          key={session.sessionId}
          className="flex flex-col gap-5 border-b border-border p-6 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 items-start gap-4">
            {/* Device Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border">
              <MonitorSmartphone size={18} />
            </div>


<div className="min-w-0">
  <div className="flex flex-wrap items-center gap-2">
    <h3 className="font-medium">
      {session.browser}
    </h3>

    {isCurrent && (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
        <Check size={13} />
        Current session
      </span>
    )}
  </div>

  <p className="mt-1 text-sm text-secondary">
    {session.os} · {session.device}
  </p>

  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
    {!isCurrent && (
      <span className="flex items-center gap-1.5">
        <Clock3 size={13} />
        Active {getTimeAgo(session.createdAt)}
      </span>
    )}

    <span>
      Created at{" "}
      {new Date(session.createdAt).toLocaleString()}
    </span>
  </div>
</div>


          </div>

          {isCurrent ? (
            <Button
              variant="danger"
             onClick={() => setCurrentLogoutModal(true)}
              className="w-full shrink-0 sm:w-auto"
            >
              <LogOut size={16} className="mr-2" />
              Log out
            </Button>
          ) : (
            <Button
              variant="danger"
onClick={() => {
  setSelectedSessionId(session.sessionId);
  setSessionLogoutModal(true);
}}
              className="w-full shrink-0 sm:w-auto"
            >
              <LogOut size={16} className="mr-2" />
              Log out
            </Button>
          )}
        </div>
      );
    })}

    {sessions.length === 0 && (
      <div className="p-8 text-center">
        <p className="text-sm text-secondary">
          No active sessions found.
        </p>
      </div>
    )}
  </div>

  {/* Logout All */}
  {sessions.length > 1 && (
    <div className="mt-4 flex justify-end">
      <Button
        variant="danger"
        onClick={() => setAllLogoutModal(true)}
      >
        <LogOut size={16} className="mr-2" />
        Log out all sessions
      </Button>
    </div>
  )}
</section>

<Modal
  open={currentLogoutModal}
  onClose={() => setCurrentLogoutModal(false)}
  title="Log out"
  description="Are you sure you want to log out of your current session?"
>
  <div className="flex justify-end gap-3">
    <Button
      variant="secondary"
      onClick={() => setCurrentLogoutModal(false)}
    >
      Cancel
    </Button>

    <Button
      variant="danger"
      onClick={() => {
        setCurrentLogoutModal(false);
        onLogout();
      }}
    >
      Log out
    </Button>
  </div>
</Modal>

<Modal
  open={sessionLogoutModal}
  onClose={() => {
    setSessionLogoutModal(false);
    setSelectedSessionId(null);
  }}
  title="Log out device"
  description="Are you sure you want to log out this device?"
>
  <div className="flex justify-end gap-3">
    <Button
      variant="secondary"
      onClick={() => {
        setSessionLogoutModal(false);
        setSelectedSessionId(null);
      }}
    >
      Cancel
    </Button>

    <Button
      variant="danger"
      onClick={() => {
        if (!selectedSessionId) return;

        setSessionLogoutModal(false);
        onLogoutSession(selectedSessionId);
        setSelectedSessionId(null);
      }}
    >
      Log out
    </Button>
  </div>
</Modal>

<Modal
  open={allLogoutModal}
  onClose={() => setAllLogoutModal(false)}
  title="Log out all sessions"
  description="Are you sure you want to log out of all other active sessions?"
>
  <div className="flex justify-end gap-3">
    <Button
      variant="secondary"
      onClick={() => setAllLogoutModal(false)}
    >
      Cancel
    </Button>

    <Button
      variant="danger"
      onClick={() => {
        setAllLogoutModal(false);
        onLogoutAll();
      }}
    >
      Log out all
    </Button>
  </div>
</Modal>

      </div>
    </main>
  );
}
