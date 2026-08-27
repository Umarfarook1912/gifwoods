export const RICH_TEXT_COPY = {
  PLACEHOLDER: "Write a detailed description…",
  FOOTER_HELP:
    "Supports headings, bold, italic, underline • bullets, numbers, alignment, colors, links, images",
  CHARACTERS: "characters",
  STYLE_NORMAL: "Normal",
  STYLE_H2: "Heading 2",
  STYLE_H3: "Heading 3",
  LINK_PROMPT: "Paste link URL",
  IMAGE_PLACEHOLDER: "Paste image URL (e.g. https://res.cloudinary.com/…)",
  YOUTUBE_PLACEHOLDER: "Paste YouTube URL (e.g. https://youtube.com/watch?v=…)",
  INSERT: "Insert",
  EMBED: "Embed",
} as const;

export const RICH_TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Dark", value: "#16130f" },
  { label: "Gold", value: "#e5a93c" },
  { label: "Warm gray", value: "#6b635b" },
  { label: "Red", value: "#b91c1c" },
] as const;
