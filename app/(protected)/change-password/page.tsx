"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { changePasswordSchema } from "../../lib/validationSchema/auth.schema";
import { validateForm } from "../../lib/validationSchema/validateForm";
import { axiosInstance } from "../../lib/axios/axiosInstance";

import Input from "../../components/ui/Input/Input";
import FormField from "../../components/ui/FormField/FormField";
import Button from "../../components/ui/Button/Button";

export default function ChangePassword() {
  const router = useRouter();

  const [formErrors, setFormErrors] = useState<Record<string, string>>(
    {}
  );

  const [isChangingPassword, setIsChangingPassword] =
    useState(false);

  const [formDetails, setFormDetails] = useState({
    currentPassword: "",
    confirmPassword: "",
    newPassword: "",
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
    e: React.SubmitEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (isChangingPassword) return;

    setFormErrors({});

    const result = validateForm(
      changePasswordSchema,
      formDetails
    );

    if (!result.success) {
      setFormErrors(result.errors);
      return;
    }

    try {
      setIsChangingPassword(true);

      const response = await axiosInstance.post(
        "/api/auth/change-password",
        result.data
      );

      toast.success(response.data.message);

      router.push("/profile");
    } catch (error: any) {
      console.log(
        "Something went wrong:",
        error.response?.data?.message ||
          error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-110">

        <button
          type="button"
          onClick={() => router.push("/profile")}
          disabled={isChangingPassword}
          className="mb-6 text-sm text-secondary transition-colors duration-150 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← Go Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Change Password
          </h1>

          <p className="mt-2 text-sm text-secondary">
            Update your password to keep your account secure.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-5"
        >
          <FormField
            label="Current Password"
            id="currentPassword"
            error={formErrors.currentPassword}
          >
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your current password"
              value={formDetails.currentPassword}
              onChange={onChange}
              error={!!formErrors.currentPassword}
              disabled={isChangingPassword}
            />
          </FormField>

          <FormField
            label="New Password"
            id="newPassword"
            error={formErrors.newPassword}
          >
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Enter your new password"
              value={formDetails.newPassword}
              onChange={onChange}
              error={!!formErrors.newPassword}
              disabled={isChangingPassword}
            />
          </FormField>

          <FormField
            label="Confirm New Password"
            id="confirmPassword"
            error={formErrors.confirmPassword}
          >
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your new password"
              value={formDetails.confirmPassword}
              onChange={onChange}
              error={!!formErrors.confirmPassword}
              disabled={isChangingPassword}
            />
          </FormField>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={isChangingPassword}
            loadingText="Changing Password"
          >
            Change Password
          </Button>
        </form>
      </div>
    </main>
  );
}

