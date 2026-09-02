import { z } from "zod";


const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .max(100, "Email is too long")
  .transform((email) => email.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must not exceed 100 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")



export const signupSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters"),

    email: emailSchema,

    password: passwordSchema,

    // confirmPassword: z
    //   .string()
    //   .min(1, "Confirm password is required"),
  })
  // .refine((data) => data.password === data.confirmPassword, {
  //   message: "Password and confirm password do not match",
  //   path: ["confirmPassword"],
  // });


export const loginSchema = z.object({
  email: emailSchema,

  password: z
    .string()
    .min(1, "Password is required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),

    newPassword: passwordSchema,

    confirmPassword: z
      .string()
      .min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });
export const setPasswordSchema = z
  .object({

    newPassword: passwordSchema,

    confirmPassword: z
      .string()
      .min(1, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
  })





export const forgotPasswordSchema = z.object({
  email: emailSchema,
});



export const resetPasswordSchema = z
  .object({
    plainToken: z
      .string()
      .min(1, "Reset token is required"),

    password: passwordSchema,

    confirmPassword: z
      .string()
      .min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password do not match",
    path: ["confirmPassword"],
  });



export const verifyEmailSchema = z.object({
  token: z
    .string()
    .min(1, "Verification token is required"),
});




export const verificationStatusSchema = z.object({
  email: emailSchema,
});



export const resetPasswordStatusSchema = z.object({
  resetRequestId: z
    .string()
    .uuid("Invalid reset request ID"),
});




export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SetPasswordInput = z.infer<
  typeof setPasswordSchema
>;
export type ChangePasswordInput = z.infer<
  typeof changePasswordSchema
>;
export type ForgotPasswordInput = z.infer<
  typeof forgotPasswordSchema
>;
export type ResetPasswordInput = z.infer<
  typeof resetPasswordSchema
>;
export type VerifyEmailInput = z.infer<
  typeof verifyEmailSchema
>;
export type VerificationStatusInput = z.infer<
  typeof verificationStatusSchema
>;
export type ResetPasswordStatusInput = z.infer<
  typeof resetPasswordStatusSchema
>;

