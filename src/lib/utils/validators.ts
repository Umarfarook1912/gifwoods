import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const pincodeSchema = z
  .string()
  .regex(/^\d{6}$/, "Enter a valid 6-digit pincode");

export const shippingAddressSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: phoneSchema,
  line1: z.string().min(5, "Address line 1 is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: pincodeSchema,
  country: z.string().default("India"),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters").max(1000),
  product_id: z.string().uuid(),
  order_id: z.string().uuid().optional().nullable(),
});

export const productSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200),
  description: z.string().min(10),
  price: z.number().positive(),
  original_price: z.number().positive().optional(),
  category_id: z.string().uuid(),
  images: z.array(z.string().url()).min(1),
  tags: z.array(z.string()),
  stock: z.number().int().min(0),
  is_featured: z.boolean(),
  badge: z.enum(["Personalize", "Bestseller", "New", "Limited"]).optional(),
  status: z.enum(["active", "draft", "archived"]),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: phoneSchema.optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
