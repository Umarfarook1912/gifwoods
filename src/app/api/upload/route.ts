import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { CUSTOMIZATION_UPLOAD } from "@/constants/customization";
import { avatarFolder, uploadToImageKit } from "@/lib/imagekit/upload";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ data: null, error: "No file uploaded" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ data: null, error: "Use a JPG, PNG, or WebP image" }, { status: 400 });
    }
    if (file.size > CUSTOMIZATION_UPLOAD.MAX_BYTES) {
      return NextResponse.json({ data: null, error: "Image must be under 5 MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const userId = session.user.supabaseId ?? session.user.id;
    const uploaded = await uploadToImageKit(
      buffer,
      `${userId}-${Date.now()}.${ext}`,
      avatarFolder(userId)
    );

    return NextResponse.json({ data: { url: uploaded.url }, error: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload file";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
