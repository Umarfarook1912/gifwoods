"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shippingAddressSchema } from "@/lib/utils/validators";
import type { ShippingAddress } from "@/types/order";

type AddressFormData = z.infer<typeof shippingAddressSchema>;

interface Props {
  defaultValues?: Partial<ShippingAddress>;
  onSubmit: (address: ShippingAddress) => void;
}

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry",
];

export function AddressForm({ defaultValues, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(shippingAddressSchema) as any,
    defaultValues: { country: "India", ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as unknown as ShippingAddress))} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" {...register("name")} className="mt-1" placeholder="Priya Sharma" />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input id="phone" {...register("phone")} className="mt-1" placeholder="9876543210" />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="line1">Address Line 1 *</Label>
        <Input id="line1" {...register("line1")} className="mt-1" placeholder="Flat 4B, Lotus Heights" />
        {errors.line1 && <p className="text-xs text-destructive mt-1">{errors.line1.message}</p>}
      </div>

      <div>
        <Label htmlFor="line2">Address Line 2</Label>
        <Input id="line2" {...register("line2")} className="mt-1" placeholder="Near Central Park" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input id="city" {...register("city")} className="mt-1" placeholder="Mumbai" />
          {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
        </div>
        <div>
          <Label htmlFor="state">State *</Label>
          <select
            id="state"
            {...register("state")}
            className="mt-1 w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-gold"
          >
            <option value="">Select state</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <p className="text-xs text-destructive mt-1">{errors.state.message}</p>}
        </div>
        <div>
          <Label htmlFor="pincode">Pincode *</Label>
          <Input id="pincode" {...register("pincode")} className="mt-1" placeholder="400001" maxLength={6} />
          {errors.pincode && <p className="text-xs text-destructive mt-1">{errors.pincode.message}</p>}
        </div>
      </div>

      <Button type="submit" className="h-12 w-full rounded-full bg-gold font-semibold text-dark hover:bg-gold-dark">
        Review order →
      </Button>
    </form>
  );
}
