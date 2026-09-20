export const ERROR_MESSAGES = {

  UNAUTHORIZED: "Please login to continue.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  USER_NOT_FOUND: "User not found.",
  ACCOUNT_ALREADY_EXISTS: "An account with this email already exists.",
  EMAIL_NOT_VERIFIED: "Please verify your email first.",
VALIDATION_ERROR: "Invalid request data.",

  ACCESS_TOKEN_MISSING: "Your session has expired. Please login again.",
  ACCESS_TOKEN_INVALID: "Your session is invalid. Please login again.",
  ACCESS_TOKEN_EXPIRED: "Your session has expired. Please login again.",


  REFRESH_TOKEN_INVALID: "Your session is invalid. Please login again.",
  REFRESH_TOKEN_EXPIRED: "Your session has expired. Please login again.",
  SESSION_REVOKED: "This session has been logged out.",


  INVALID_PASSWORD: "Invalid password.",
  PASSWORD_REQUIRED: "Password is required.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters.",
  PASSWORD_CHANGE_FAILED: "Failed to change password.",


  GOOGLE_AUTH_FAILED: "Google login failed. Please try again.",
  GOOGLE_AUTH_STATE_INVALID: "Google login session is invalid. Please try again.",

  
  TWO_FACTOR_ALREADY_ENABLED: "Two-factor authentication is already enabled.",
  TWO_FACTOR_NOT_ENABLED: "Two-factor authentication is not enabled.",
  TWO_FACTOR_CODE_INVALID: "Invalid verification code.",
  TWO_FACTOR_SETUP_FAILED: "Failed to set up two-factor authentication.",
  TWO_FACTOR_DISABLE_FAILED: "Failed to disable two-factor authentication.",


  VALIDATION_FAILED: "Please check your information and try again.",
  REQUIRED_FIELDS_MISSING: "Please fill in all required fields.",

  BAD_REQUEST: "Something is wrong with your request.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  INTERNAL_SERVER_ERROR: "Something went wrong. Please try again.",
} as const;