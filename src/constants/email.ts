export const BREVO_API = {
  BASE_URL: "https://api.brevo.com/v3",
  SEND_EMAIL_PATH: "/smtp/email",
} as const;

export const EMAIL_DEFAULTS = {
  FROM_NAME: "Gifwoods",
  FROM_EMAIL: "gifwoodsteam@gmail.com",
} as const;
