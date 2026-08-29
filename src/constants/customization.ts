export const CUSTOMIZATION_COPY = {
  TEXT_TOGGLE: "Collect text after payment",
  IMAGE_TOGGLE: "Collect image after payment",
  PRODUCT_NOTICE_BOTH:
    "After payment we will ask for your name/text and customization photo via WhatsApp on the order page.",
  PRODUCT_NOTICE_TEXT:
    "After payment we will ask for your name or message on the order page.",
  PRODUCT_NOTICE_IMAGE:
    "After payment we will ask for your customization photo via WhatsApp on the order page.",
  FORM_HEADING: "Personalization needed",
  FORM_HELP:
    "Please submit the details below so we can complete your gift.",
  NAME_LABEL: "Name / text",
  NAME_PLACEHOLDER: "Enter the name or short message",
  PHOTO_LABEL: "Photo (via WhatsApp)",
  SUBMIT: "Submit details",
  SUBMIT_WHATSAPP: "Submit & Send on WhatsApp",
  SEND_WHATSAPP: "Send on WhatsApp",
  REOPEN_WHATSAPP: "Open WhatsApp chat",
  WHATSAPP_PHOTO_HINT:
    "Please attach your customization photo in the WhatsApp chat that opens after clicking send.",
  WHATSAPP_PHOTO_SENT: "Photo sent via WhatsApp",
  WHATSAPP_ADMIN_NOTE: "Photo: Sent by customer on WhatsApp",
  SUBMITTED_STATUS: "Submitted",
  SUBMITTED: "Your customization details have been submitted",
  SUBMITTED_PHOTO: "Your photo instructions have been sent via WhatsApp",
  SUBMITTED_TEXT: "Your name has been submitted",
  RECEIVED: "We received your details",
  RECEIVED_PHOTO: "Photo sent via WhatsApp",
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
