export const APP_ERRORS = {
  GENERIC: "Something went wrong. Please try again.",
  VALIDATION: "Please check your input and try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested item was not found.",
  NETWORK: "Network error. Please check your connection and try again.",

  EMAIL_EXISTS: "An account with this email already exists.",
  REGISTRATION_FAILED: "Registration failed. Please try again.",
  ACCOUNT_SETUP_FAILED: "Account setup failed. Please try again.",

  PROFILE_SAVE_FAILED: "Failed to save profile. Please try again.",
  AVATAR_UPLOAD_FAILED: "Failed to upload avatar. Please try again.",
  PASSWORD_UPDATE_FAILED: "Failed to update password. Please try again.",
  PASSWORD_RESET_FAILED: "Could not send reset instructions. Please try again.",
  PASSWORD_RESET_INVALID: "This reset link is invalid or has expired. Please request a new one.",
  ADDRESS_SAVE_FAILED: "Failed to save address. Please try again.",
  ADDRESS_DELETE_FAILED: "Failed to delete address. Please try again.",

  PAYMENT_FAILED: "Payment could not be completed. Please try again.",
  PAYMENT_INIT_FAILED: "Could not start payment. Please try again.",
  ORDER_CREATE_FAILED: "Could not create your order. Please try again.",
  ORDER_DELETE_FAILED: "Failed to delete order. Please try again.",
  ORDER_UPDATE_FAILED: "Failed to update order status. Please try again.",
  MIXED_TEST_CART:
    "Test products cannot be checked out with regular products. Remove one type and try again.",
  CUSTOMIZATION_SUBMIT_FAILED: "Failed to submit customization. Please try again.",

  PRODUCT_SAVE_FAILED: "Failed to save product. Please try again.",
  PRODUCT_DELETE_FAILED: "Failed to delete product. Please try again.",
  PRODUCT_LOAD_FAILED: "Failed to load product details. Please try again.",
  CATEGORY_ADD_FAILED: "Failed to add category. Please try again.",
  CATEGORY_DELETE_FAILED: "Failed to delete category. Please try again.",
  CATEGORY_LOAD_FAILED: "Failed to load categories. Please try again.",

  REVIEW_SUBMIT_FAILED: "Failed to submit review. Please try again.",
  REVIEW_UPDATE_FAILED: "Failed to update review. Please try again.",

  ADMIN_CREATE_FAILED: "Failed to create admin account. Please try again.",
  ADMIN_UPDATE_FAILED: "Failed to update admin details. Please try again.",
  ADMIN_DELETE_FAILED: "Failed to delete admin. Please try again.",
  ADMIN_PROMOTE_FAILED: "Failed to promote user to admin. Please try again.",
  USER_DELETE_FAILED: "Failed to delete user. Please try again.",

  ANALYTICS_LOAD_FAILED: "Failed to load analytics. Please try again.",
  TRACKING_LOAD_FAILED: "Could not load tracking information. Please try again.",
  SHIPROCKET_SYNC_FAILED: "Failed to sync shipment from Shiprocket. Please try again.",
  UPLOAD_FAILED: "Upload failed. Please try again.",
  CONTACT_SEND_FAILED: "Failed to send message. Please try again.",
  DELIVERY_ESTIMATE_FAILED: "Unable to fetch delivery estimate. Please try again.",
} as const;
