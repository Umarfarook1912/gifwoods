export const AUTH_PROVIDERS = {
  GOOGLE: "google",
  EMAIL: "email",
  EMAIL_PASSWORD: "email-password",
} as const;

export const AUTH_NAV_LABELS = {
  LOGIN: "Login",
  REGISTER: "Register",
  PROFILE: "Profile",
  MY_ORDERS: "My Orders",
  ADDRESS_BOOK: "Address Book",
  ADMIN: "Admin",
  SIGN_OUT: "Sign Out",
} as const;

export const AUTH_COPY = {
  FORGOT_PASSWORD_LINK: "Forgot password?",
  FORGOT_PASSWORD_TITLE: "Reset your password",
  FORGOT_PASSWORD_SUBTITLE:
    "Enter your email address and we will send you instructions to reset your password.",
  FORGOT_PASSWORD_SUBMIT: "Send reset link",
  FORGOT_PASSWORD_SENDING: "Sending…",
  FORGOT_PASSWORD_SUCCESS:
    "If an account exists for this email, we've sent password reset instructions.",
  FORGOT_PASSWORD_BACK_TO_LOGIN: "Back to sign in",
  RESET_PASSWORD_TITLE: "Choose a new password",
  RESET_PASSWORD_SUBTITLE: "Enter a new password for your account.",
  RESET_PASSWORD_EMAIL_LABEL: "Email address",
  RESET_PASSWORD_SUBMIT: "Update password",
  RESET_PASSWORD_UPDATING: "Updating…",
  RESET_PASSWORD_SUCCESS_LOGIN: "Password updated. Please sign in with your new password.",
  RESET_PASSWORD_INVALID_LINK:
    "This reset link is invalid or has expired. Please request a new one.",
  RESET_PASSWORD_REQUEST_NEW: "Request a new reset link",
  NEW_PASSWORD_LABEL: "New password",
  CONFIRM_PASSWORD_LABEL: "Confirm new password",
  PASSWORD_RESET_EMAIL_SUBJECT: "Reset your password",
  PASSWORD_RESET_EMAIL_CTA: "Reset password",
  PASSWORD_RESET_EMAIL_EXPIRY: "This link expires in 1 hour. If you did not request this, you can safely ignore this email.",
} as const;

export const AUTH_QUERY = {
  RESET_SUCCESS: "reset",
  RESET_SUCCESS_VALUE: "success",
  INACTIVE_ACCOUNT: "InactiveAccount",
} as const;
