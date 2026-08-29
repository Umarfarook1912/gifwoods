import DOMPurify from "dompurify";
import type { Config } from "dompurify";

const SANITIZE_OPTIONS: Config = {
  USE_PROFILES: { html: true },
  ADD_TAGS: ["iframe"],
  ADD_ATTR: [
    "allow",
    "allowfullscreen",
    "frameborder",
    "scrolling",
    "src",
    "width",
    "height",
    "target",
    "rel",
    "style",
  ],
};

/** Sanitize rich HTML for safe rendering (client or Node with window). */
export function sanitizeHtml(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined") {
    return html
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "")
      .replace(/\son\w+='[^']*'/gi, "");
  }
  return DOMPurify.sanitize(html, SANITIZE_OPTIONS);
}
