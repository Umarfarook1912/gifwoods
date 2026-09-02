import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_SHIPMENT_WEIGHT_KG } from "@/constants/shipping";
import { getShiprocketDeliveryEstimate } from "@/lib/shipping/delivery-estimate";
import { pincodeSchema } from "@/lib/utils/validators";

const querySchema = z.object({
  pincode: pincodeSchema,
  customization_text: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  customization_image: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  declared_value: z.coerce.number().positive(),
});

export async function GET(request: Request) {
  const pickupPostcode = process.env.SHIPROCKET_PICKUP_PINCODE;
  if (!pickupPostcode) {
    return NextResponse.json(
      { data: null, error: "Pickup pincode is not configured" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    pincode: searchParams.get("pincode") ?? "",
    customization_text: searchParams.get("customization_text") ?? "false",
    customization_image: searchParams.get("customization_image") ?? "false",
    declared_value: searchParams.get("declared_value"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { data: null, error: "Invalid pincode or product value" },
      { status: 400 }
    );
  }

  const { pincode, customization_text, customization_image, declared_value } =
    parsed.data;

  try {
    const data = await getShiprocketDeliveryEstimate({
      pincode,
      pickupPostcode,
      weightKg: DEFAULT_SHIPMENT_WEIGHT_KG,
      declaredValue: declared_value,
      product: {
        customization_text,
        customization_image,
      },
    });

    return NextResponse.json({ data, error: null });
  } catch (error) {
    console.error("Shiprocket delivery estimate failed:", error);
    return NextResponse.json(
      { data: null, error: "Unable to fetch delivery estimate" },
      { status: 502 }
    );
  }
}
