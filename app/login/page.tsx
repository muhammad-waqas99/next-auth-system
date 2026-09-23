
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Input from "../components/ui/Input/Input";
import FormField from "../components/ui/FormField/FormField";
import Button from "../components/ui/Button/Button";

import { loginSchema } from "../lib/validationSchema/auth.schema";
import { validateForm } from "../lib/validationSchema/validateForm";
import { axiosInstance } from "../lib/axios/axiosInstance";

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [user, setUser] = useState<LoginForm>({
    email: "",
    password: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const onLogin = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoggingIn) return;

    setFormErrors({});

    const result = validateForm(loginSchema, user);

    if (!result.success) {
      setFormErrors(result.errors);
      return;
    }

    try {
      setIsLoggingIn(true);

      const response = await axiosInstance.post(
        "/api/auth/login",
        result.data
      );

      toast.success(response.data.message);

      if (response.data.requiresTwoFactor) {
        router.push(
          `/two-factor/login?challenge=${response.data.challenge}`
        );
        return;
      }

      router.push("/profile");
    } catch (error: any) {
      console.log("Something went wrong");

      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const onGoogleClick = () => {
    window.location.href = "/api/auth/google";
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-110">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-secondary">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={onLogin} className="flex flex-col gap-5">
          <FormField
            label="Email"
            id="email"
            error={formErrors.email}
          >
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={user.email}
              onChange={onChange}
              error={!!formErrors.email}
              autoComplete="email"
            />
          </FormField>

          <FormField
            label="Password"
            id="password"
            error={formErrors.password}
          >
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={user.password}
                onChange={onChange}
                error={!!formErrors.password}
                autoComplete="current-password"
                className="pr-16"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-secondary transition-colors duration-150 hover:text-foreground"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </FormField>

          <div className="flex justify-end -mt-1">
            <Link
              href="/forget-password"
              className="text-sm text-accent hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isLoggingIn}
            loadingText="Logging in"
          >
            Login
          </Button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />

          <span className="text-xs text-muted">OR</span>

          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="secondary"
          fullWidth
          onClick={onGoogleClick}
          disabled={isLoggingIn}
        >
          <span className="mr-2 text-base font-semibold">G</span>
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-secondary">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="font-medium text-accent hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}

