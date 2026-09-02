import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { sendContactEmail } from "@/lib/email/nodemailer";
import { contactFormSchema } from "@/lib/utils/validators";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ data: null, error: APP_ERRORS.VALIDATION }, { status: 400 });
  }

  try {
    await sendContactEmail(parsed.data);
    return NextResponse.json({ data: { sent: true }, error: null });
  } catch (error) {
    console.error(APP_ERRORS.CONTACT_SEND_FAILED, error);
    return NextResponse.json(
      { data: null, error: APP_ERRORS.CONTACT_SEND_FAILED },
      { status: 500 }
    );
  }
}
