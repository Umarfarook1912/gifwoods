"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/shared/StarRating";
import { reviewSchema } from "@/lib/utils/validators";
import { API_ENDPOINTS } from "@/constants/api";
import { toast } from "sonner";
import type { ReviewFormData } from "@/types/review";

interface Props {
  productId: string;
  orderId?: string | null;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, orderId, onSuccess }: Props) {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { product_id: productId, order_id: orderId || null, rating: 0, comment: "" },
  });

  const handleRate = (val: number) => {
    setRating(val);
    setValue("rating", val, { shouldValidate: true });
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.REVIEWS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, rating }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed to submit");
      toast.success("Review submitted!", {
        description: "It will appear after admin approval.",
      });
      reset();
      setRating(0);
      onSuccess?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label className="text-sm font-semibold text-dark mb-2 block">Your rating</Label>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onRate={handleRate}
        />
      </div>
      <div>
        <Label htmlFor="comment" className="text-sm font-semibold text-dark mb-2 block">
          Your review
        </Label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this gift..."
          rows={4}
          {...register("comment")}
          className="border-border focus-visible:ring-gold resize-none"
        />
        {errors.comment && (
          <p className="text-xs text-destructive mt-1">{errors.comment.message}</p>
        )}
      </div>
      <Button
        type="submit"
        disabled={loading || rating === 0}
        className="bg-gold text-dark hover:bg-gold-dark font-semibold"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
