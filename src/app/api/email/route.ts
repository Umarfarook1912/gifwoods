import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email/nodemailer";
import { contactFormSchema } from "@/lib/utils/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ data: null, error: parsed.error.message }, { status: 400 });
  }

  try {
    await sendContactEmail(parsed.data);
    return NextResponse.json({ data: { sent: true }, error: null });
  } catch {
    return NextResponse.json(
      { data: null, error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}
