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


  })



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

const passwordInputSchema = z
  .string()
  .min(1, "Password is required");

const challengeSchema = z
  .string()
  .min(1, "Challenge is required");

const otpSchema = z
  .string()
  .length(6, "OTP must be exactly 6 digits")
  .regex(/^\d+$/, "OTP must contain only digits");

const backupCodeSchema = z
  .string()
  .min(1, "Backup code is required");

const otpSecretSchema = z
  .string()
  .min(1, "OTP secret is required");


  export const backupLoginSchema = z.object({
  challenge: challengeSchema,
  backupCode: backupCodeSchema,
});

export const disableTwoFactorSchema = z.object({
  password: passwordInputSchema,
});

export const regeneratePasswordSchema = z.object({
  password: passwordInputSchema,
});

export const setupTwoFactorSchema = z.object({
  password: passwordInputSchema,
});

export const verifyDisableSchema = z.object({
  challenge: challengeSchema,
  otp: otpSchema,
  backupCode: backupCodeSchema,
});

export const verifyOtpSchema  = z.object({
  challenge: challengeSchema,
  otp: otpSchema,
});

export const verifyRegenerateSchema = z.object({
  challenge: challengeSchema,
  otp: otpSchema,
});

export const verifySetupSchema = z.object({
  otpSecret: otpSecretSchema,
  otp: otpSchema,
});


export type BackupLoginInput = z.infer<typeof backupLoginSchema>;
export type DisableTwoFactorInput = z.infer<typeof disableTwoFactorSchema>;
export type RegeneratePasswordInput = z.infer<typeof regeneratePasswordSchema>;
export type SetupTwoFactorInput = z.infer<typeof setupTwoFactorSchema>;
export type VerifyDisableInput = z.infer<typeof verifyDisableSchema>;
export type VerifyLoginInput = z.infer<typeof verifyOtpSchema >;
export type VerifyRegenerateInput = z.infer<typeof verifyRegenerateSchema>;
export type VerifySetupInput = z.infer<typeof verifySetupSchema>;

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

