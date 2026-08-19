export const CUSTOMIZATION_COPY = {
  TEXT_TOGGLE: "Collect text after payment",
  IMAGE_TOGGLE: "Collect image after payment",
  PRODUCT_NOTICE_BOTH:
    "After payment we will ask for your name and photo on the order page.",
  PRODUCT_NOTICE_TEXT:
    "After payment we will ask for your name or message on the order page.",
  PRODUCT_NOTICE_IMAGE:
    "After payment we will ask for your photo on the order page. We confirm when it is received.",
  FORM_HEADING: "Personalization needed",
  FORM_HELP:
    "Please submit the details below so we can complete your gift. We will confirm once your photo is received.",
  NAME_LABEL: "Name / text",
  NAME_PLACEHOLDER: "Enter the name or short message",
  PHOTO_LABEL: "Photo",
  SUBMIT: "Submit details",
  SUBMITTED_STATUS: "Submitted",
  SUBMITTED: "Your details have been submitted",
  SUBMITTED_PHOTO: "Your photo has been submitted",
  SUBMITTED_TEXT: "Your name has been submitted",
  RECEIVED: "We received your details",
  RECEIVED_PHOTO: "We received your photo",
  RECEIVED_TEXT: "We received your name",
  NEED_TEXT: "Text",
  NEED_IMAGE: "Image",
  NEED_BOTH: "Text + image",
  PENDING: "Pending",
  RECEIVED_STATUS: "Received",
  LOCKED: "These details are locked after submit.",
  COLUMN: "Customization",
  HAS_DETAILS: "Details submitted",
  VIEW_DETAILS: "View customization",
  DOWNLOAD_IMAGE: "Download image",
} as const;

export const CUSTOMIZATION_UPLOAD = {
  MAX_BYTES: 5 * 1024 * 1024,
  ACCEPT: "image/jpeg,image/png,image/webp",
  FOLDER_PREFIX: "customizations",
  AVATAR_FOLDER: "avatars",
  FALLBACK_CATEGORY: "uncategorised",
  FALLBACK_FILE: "photo",
} as const;
