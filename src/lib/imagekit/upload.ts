import { CUSTOMIZATION_UPLOAD } from "@/constants/customization";
import { sanitizeFolderStem } from "@/lib/customization";

interface ImageKitUploadResult {
  url: string;
  fileId: string;
}

export async function uploadToImageKit(
  buffer: Buffer,
  fileName: string,
  folder: string,
  uniqueFileName = true
): Promise<ImageKitUploadResult> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is not configured");
  }

  const auth = Buffer.from(`${privateKey}:`).toString("base64");
  const form = new FormData();
  form.append("file", buffer.toString("base64"));
  form.append("fileName", fileName);
  form.append("folder", folder);
  form.append("useUniqueFileName", uniqueFileName ? "true" : "false");

  const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}` },
    body: form,
  });

  const json = (await res.json()) as {
    url?: string;
    fileId?: string;
    message?: string;
  };
  if (!res.ok || !json.url || !json.fileId) {
    throw new Error(json.message ?? "ImageKit upload failed");
  }
  return { url: json.url, fileId: json.fileId };
}

export function avatarFolder(userId: string): string {
  return `${CUSTOMIZATION_UPLOAD.AVATAR_FOLDER}/${userId}`;
}

export function customizationFolder(categorySlug?: string | null): string {
  const category = sanitizeFolderStem(
    categorySlug ?? "",
    CUSTOMIZATION_UPLOAD.FALLBACK_CATEGORY
  );
  return `${CUSTOMIZATION_UPLOAD.FOLDER_PREFIX}/${category}`;
}
