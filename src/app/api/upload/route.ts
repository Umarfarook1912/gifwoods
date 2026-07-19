import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ data: null, error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique name
    const fileExt = path.extname(file.name) || ".png";
    const fileName = `${session.user.id}-${Date.now()}${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;
    return NextResponse.json({ data: { url: fileUrl }, error: null });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ data: null, error: error.message || "Failed to upload file" }, { status: 500 });
  }
}
