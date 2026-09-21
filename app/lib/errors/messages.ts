export const ERROR_CODES = {
  GOOGLE_AUTH_CODE_MISSING: "GOOGLE_AUTH_CODE_MISSING",
  INVALID_GOOGLE_STATE: "INVALID_GOOGLE_STATE",
  GOOGLE_TOKEN_EXCHANGE_FAILED: "GOOGLE_TOKEN_EXCHANGE_FAILED",
  GOOGLE_USER_INFO_FAILED: "GOOGLE_USER_INFO_FAILED",
  INVALID_GOOGLE_USER_INFO: "INVALID_GOOGLE_USER_INFO",

  VALIDATION_ERROR: "VALIDATION_ERROR",
  GOOGLE_ACCOUNT_EXISTS: "GOOGLE_ACCOUNT_EXISTS",

  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  INVALID_PASSWORD: "INVALID_PASSWORD",
  PASSWORD_LOGIN_UNAVAILABLE: "PASSWORD_LOGIN_UNAVAILABLE",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  GOOGLE_AUTH_REQUIRED: "GOOGLE_AUTH_REQUIRED",
  PASSWORD_ALREADY_SET: "PASSWORD_ALREADY_SET",

  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_ALREADY_EXISTS: "USER_ALREADY_EXISTS",

  INVALID_SESSION: "INVALID_SESSION",

  INVALID_RESET_TOKEN: "INVALID_RESET_TOKEN",
  RESET_TOKEN_EXPIRED: "RESET_TOKEN_EXPIRED",
  INVALID_RESET_REQUEST: "INVALID_RESET_REQUEST",

  INVALID_VERIFICATION_TOKEN: "INVALID_VERIFICATION_TOKEN",
  VERIFICATION_TOKEN_EXPIRED: "VERIFICATION_TOKEN_EXPIRED",

  INVALID_LOGIN_CHALLENGE: "INVALID_LOGIN_CHALLENGE",
  LOGIN_CHALLENGE_USED: "LOGIN_CHALLENGE_USED",
  LOGIN_CHALLENGE_EXPIRED: "LOGIN_CHALLENGE_EXPIRED",

  INVALID_DISABLE_CHALLENGE: "INVALID_DISABLE_CHALLENGE",
  DISABLE_CHALLENGE_USED: "DISABLE_CHALLENGE_USED",
  DISABLE_CHALLENGE_EXPIRED: "DISABLE_CHALLENGE_EXPIRED",

  INVALID_REGENERATE_CHALLENGE: "INVALID_REGENERATE_CHALLENGE",
  REGENERATE_CHALLENGE_USED: "REGENERATE_CHALLENGE_USED",
  REGENERATE_CHALLENGE_EXPIRED: "REGENERATE_CHALLENGE_EXPIRED",

  TWO_FACTOR_ALREADY_ENABLED: "TWO_FACTOR_ALREADY_ENABLED",
  TWO_FACTOR_ALREADY_DISABLED: "TWO_FACTOR_ALREADY_DISABLED",
  TWO_FACTOR_NOT_ENABLED: "TWO_FACTOR_NOT_ENABLED",
  TWO_FACTOR_SETUP_IN_PROGRESS: "TWO_FACTOR_SETUP_IN_PROGRESS",
  NO_ACTIVE_TWO_FACTOR_SETUP: "NO_ACTIVE_TWO_FACTOR_SETUP",
  TWO_FACTOR_SETUP_EXPIRED: "TWO_FACTOR_SETUP_EXPIRED",
  INVALID_TWO_FACTOR_SETUP: "INVALID_TWO_FACTOR_SETUP",

  INVALID_OTP: "INVALID_OTP",
  INVALID_BACKUP_CODE: "INVALID_BACKUP_CODE",

  BACKUP_CODES_NOT_FOUND: "BACKUP_CODES_NOT_FOUND",
  BACKUP_CODE_REGENERATION_COOLDOWN:
    "BACKUP_CODE_REGENERATION_COOLDOWN",

  PASSWORD_REQUIRED_FOR_2FA_SETUP:
    "PASSWORD_REQUIRED_FOR_2FA_SETUP",
  PASSWORD_REQUIRED_FOR_2FA_DISABLE:
    "PASSWORD_REQUIRED_FOR_2FA_DISABLE",
  PASSWORD_REQUIRED_FOR_BACKUP_CODE_REGENERATION:
    "PASSWORD_REQUIRED_FOR_BACKUP_CODE_REGENERATION",
} as const;

export const ERROR_MESSAGES = {
  GOOGLE_AUTH_CODE_MISSING: "Authorization code is missing.",
  INVALID_GOOGLE_STATE: "Invalid authentication state.",
  GOOGLE_TOKEN_EXCHANGE_FAILED:
    "Failed to exchange authorization code.",
  GOOGLE_USER_INFO_FAILED:
    "Failed to get Google user information.",
  INVALID_GOOGLE_USER_INFO:
    "Invalid Google user information.",

  UNAUTHORIZED: "Please login to continue.",
  GOOGLE_ACCOUNT_EXISTS:
    "Account already exists. Please continue with Google.",

  VALIDATION_ERROR: "Invalid request data.",
  PASSWORD_ALREADY_SET:
    "Password is already set for this account.",

  INVALID_CREDENTIALS: "Invalid email or password.",
  INVALID_PASSWORD: "Incorrect password.",
  PASSWORD_LOGIN_UNAVAILABLE:
    "Password login is not available for this account.",
  EMAIL_NOT_VERIFIED:
    "Please verify your email before logging in. Check your inbox for the verification link.",
  GOOGLE_AUTH_REQUIRED:
    "This account uses Google Sign-In. Please continue with Google.",

  USER_NOT_FOUND: "User not found.",
  USER_ALREADY_EXISTS:
    "An account with this email already exists.",

  INVALID_SESSION:
    "The requested session could not be found.",

  INVALID_RESET_TOKEN:
    "Invalid or expired password reset link.",
  RESET_TOKEN_EXPIRED:
    "Your password reset link has expired. Please request a new one.",
  INVALID_RESET_REQUEST:
    "Invalid reset request.",

  INVALID_VERIFICATION_TOKEN:
    "Invalid or expired email verification link.",
  VERIFICATION_TOKEN_EXPIRED:
    "Your email verification link has expired. Please request a new one.",

  INVALID_LOGIN_CHALLENGE:
    "Invalid login request.",
  LOGIN_CHALLENGE_USED:
    "This login request has already been completed.",
  LOGIN_CHALLENGE_EXPIRED:
    "This login request has expired. Please log in again.",

  INVALID_DISABLE_CHALLENGE:
    "Invalid 2FA disable request.",
  DISABLE_CHALLENGE_USED:
    "This 2FA disable request has already been completed.",
  DISABLE_CHALLENGE_EXPIRED:
    "This 2FA disable request has expired. Please start again.",

  INVALID_REGENERATE_CHALLENGE:
    "Invalid backup code regeneration request.",
  REGENERATE_CHALLENGE_USED:
    "This backup code regeneration request has already been completed.",
  REGENERATE_CHALLENGE_EXPIRED:
    "This backup code regeneration request has expired. Please start again.",

  TWO_FACTOR_ALREADY_ENABLED:
    "Two-factor authentication is already enabled.",
  TWO_FACTOR_ALREADY_DISABLED:
    "Two-factor authentication is already disabled.",
  TWO_FACTOR_NOT_ENABLED:
    "Two-factor authentication is not enabled.",
  TWO_FACTOR_SETUP_IN_PROGRESS:
    "A 2FA setup is already in progress. Please complete it or wait for it to expire.",
  NO_ACTIVE_TWO_FACTOR_SETUP:
    "No active 2FA setup was found. Please start again.",
  TWO_FACTOR_SETUP_EXPIRED:
    "Your 2FA setup has expired. Please start again.",
  INVALID_TWO_FACTOR_SETUP:
    "Invalid 2FA setup.",

  INVALID_OTP:
    "Invalid or expired verification code.",
  INVALID_BACKUP_CODE:
    "Invalid or already used backup code.",

  BACKUP_CODES_NOT_FOUND:
    "Backup codes could not be found.",
  BACKUP_CODE_REGENERATION_COOLDOWN:
    "Backup codes can only be regenerated once every 30 days.",

  PASSWORD_REQUIRED_FOR_2FA_SETUP:
    "Please set a password before enabling 2FA.",
  PASSWORD_REQUIRED_FOR_2FA_DISABLE:
    "Please set a password before disabling 2FA.",
  PASSWORD_REQUIRED_FOR_BACKUP_CODE_REGENERATION:
    "Please set a password before regenerating your backup codes.",
} as const;

export const SUCCESS_CODES = {
  PASSWORD_RESET_PENDING: "PASSWORD_RESET_PENDING",
  CURRENT_USER_DETAILS_FETCHED:
    "CURRENT_USER_DETAILS_FETCHED",
  VERIFICATION_STATUS_FETCHED:
    "VERIFICATION_STATUS_FETCHED",

  SIGNUP_SUCCESS: "SIGNUP_SUCCESS",
  PASSWORD_SET: "PASSWORD_SET",
  CURRENT_SESSIONS_FETCHED:
    "CURRENT_SESSIONS_FETCHED",

  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  TWO_FACTOR_REQUIRED: "TWO_FACTOR_REQUIRED",
  LOGOUT_SUCCESS: "LOGOUT_SUCCESS",
  LOGOUT_ALL_SUCCESS: "LOGOUT_ALL_SUCCESS",
  SESSION_LOGOUT_SUCCESS:
    "SESSION_LOGOUT_SUCCESS",
  TOKEN_REFRESHED: "TOKEN_REFRESHED",

  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  PASSWORD_RESET: "PASSWORD_RESET",
  PASSWORD_RESET_EMAIL_SENT:
    "PASSWORD_RESET_EMAIL_SENT",

  EMAIL_VERIFIED: "EMAIL_VERIFIED",

  TWO_FACTOR_SETUP_STARTED:
    "TWO_FACTOR_SETUP_STARTED",
  TWO_FACTOR_ENABLED: "TWO_FACTOR_ENABLED",
  TWO_FACTOR_DISABLED:
    "TWO_FACTOR_DISABLED",

  BACKUP_CODES_REGENERATED:
    "BACKUP_CODES_REGENERATED",

  DISABLE_CHALLENGE_CREATED:
    "DISABLE_CHALLENGE_CREATED",
  REGENERATE_CHALLENGE_CREATED:
    "REGENERATE_CHALLENGE_CREATED",
} as const;

export const SUCCESS_MESSAGES = {
  PASSWORD_RESET_PENDING:
    "Password reset is still pending.",

  CURRENT_USER_DETAILS_FETCHED:
    "Current user details fetched successfully.",
  VERIFICATION_STATUS_FETCHED:
    "Verification status fetched successfully.",

  SIGNUP_SUCCESS:
    "Account created successfully. Please check your email to verify your account.",
  PASSWORD_SET:
    "Password set successfully.",
  CURRENT_SESSIONS_FETCHED:
    "Sessions fetched successfully.",

  LOGIN_SUCCESS:
    "Logged in successfully.",
  TWO_FACTOR_REQUIRED:
    "Two-factor authentication is required.",
  LOGOUT_SUCCESS:
    "Logged out successfully.",
  LOGOUT_ALL_SUCCESS:
    "Logged out from all devices successfully.",
  SESSION_LOGOUT_SUCCESS:
    "Logged out of the selected session successfully.",
  TOKEN_REFRESHED:
    "Token refreshed successfully.",

  PASSWORD_CHANGED:
    "Password changed successfully.",
  PASSWORD_RESET:
    "Password reset successfully.",
  PASSWORD_RESET_EMAIL_SENT:
    "If an account exists with this email, a password reset link has been sent.",

  EMAIL_VERIFIED:
    "Email verified successfully.",

  TWO_FACTOR_SETUP_STARTED:
    "2FA setup started successfully.",
  TWO_FACTOR_ENABLED:
    "Two-factor authentication enabled successfully.",
  TWO_FACTOR_DISABLED:
    "Two-factor authentication disabled successfully.",

  BACKUP_CODES_REGENERATED:
    "Backup codes regenerated successfully.",

  DISABLE_CHALLENGE_CREATED:
    "Password verified. Continue to disable two-factor authentication.",
  REGENERATE_CHALLENGE_CREATED:
    "Password verified. Continue to regenerate your backup codes.",
} as const;