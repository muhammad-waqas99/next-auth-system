"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import Input from "../../components/ui/Input/Input";
import FormField from "../../components/ui/FormField/FormField";
import Button from "../../components/ui/Button/Button";

import { signupSchema } from "../../lib/validationSchema/auth.schema";
import { validateForm } from "../../lib/validationSchema/validateForm";
import { axiosInstance } from "../../lib/axios/axiosInstance";

interface SignupForm {
  name: string;
  email: string;
  password: string;
}

export default function Signup() {
  const router = useRouter();

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const [user, setUser] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const onSignup = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    setFormErrors({});

    const result = validateForm(signupSchema, user);

    if (!result.success) {
      setFormErrors(result.errors);
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/api/auth/signup",
        result.data
      );

      console.log(response.data);

      toast.success(response.data.message);

      router.push(`/verify-email-sent?email=${result.data.email}`);
    } catch (error: any) {
      console.log("Something went wrong");

      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    }
  };

  const onGoogleClick = async () => {
    try {
      window.location.href = "/api/auth/google";
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-110">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-secondary">
            Enter your details to create your account
          </p>
        </div>

        <form onSubmit={onSignup} className="flex flex-col gap-5">
          <FormField
            label="Name"
            id="name"
            error={formErrors.name}
          >
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={user.name}
              onChange={onChange}
              error={!!formErrors.name}
            />
          </FormField>

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

          <Button
            type="submit"
            variant="primary"
            fullWidth
            className="mt-1"
          >
            Create account
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
        >
          Continue with Google
        </Button>

        <p className="mt-6 text-center text-sm text-secondary">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-accent hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}

