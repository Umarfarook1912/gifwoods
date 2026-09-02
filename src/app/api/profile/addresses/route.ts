import { NextResponse } from "next/server";
import { APP_ERRORS } from "@/constants/errors";
import { auth } from "@/lib/auth/auth";
import { apiError } from "@/lib/errors/api-response";
import { getAddresses, createAddress } from "@/lib/supabase/profile-db";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.supabaseId ?? session.user.id;
    const data = await getAddresses(userId);
    return NextResponse.json({ data, error: null });
  } catch (error) {
    return apiError(error, APP_ERRORS.GENERIC);
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = session.user.supabaseId ?? session.user.id;
    const body = await request.json();
    
    // Quick validation
    const { name, phone, street_address, apartment, city, state, postal_code, country, is_default_shipping, is_default_billing } = body;
    if (!name || !phone || !street_address || !city || !state || !postal_code) {
      return NextResponse.json({ data: null, error: "Missing required fields" }, { status: 400 });
    }

    const data = await createAddress(userId, {
      name,
      phone,
      street_address,
      apartment: apartment || null,
      city,
      state,
      postal_code,
      country: country || "India",
      is_default_shipping: !!is_default_shipping,
      is_default_billing: !!is_default_billing,
    });

    return NextResponse.json({ data, error: null }, { status: 201 });
  } catch (error) {
    return apiError(error, APP_ERRORS.ADDRESS_SAVE_FAILED);
  }
}
