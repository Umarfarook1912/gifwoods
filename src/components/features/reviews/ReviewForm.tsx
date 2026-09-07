"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/shared/StarRating";
import { MyReviewStatus } from "./MyReviewStatus";
import { reviewSchema } from "@/lib/utils/validators";
import { API_ENDPOINTS } from "@/constants/api";
import { REVIEW_COPY } from "@/constants/reviews";
import { APP_ERRORS } from "@/constants/errors";
import { toastError } from "@/lib/errors/toast";
import { toast } from "sonner";
import type { Review, ReviewFormData } from "@/types/review";

interface Props {
  productId: string;
  orderId?: string | null;
  onSuccess?: (review: Review) => void;
}

export function ReviewForm({ productId, orderId, onSuccess }: Props) {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [myReview, setMyReview] = useState<Review | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    async function loadMine() {
      setChecking(true);
      try {
        const res = await fetch(
          `${API_ENDPOINTS.REVIEWS_MINE}?productId=${encodeURIComponent(productId)}`
        );
        if (!res.ok) return;
        const json = (await res.json()) as { data: Review | null };
        if (!cancelled) setMyReview(json.data);
      } catch {
        // Non-blocking — form still available if lookup fails
      } finally {
        if (!cancelled) setChecking(false);
      }
    }
    void loadMine();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const handleRate = (val: number) => {
    setRating(val);
    setValue("rating", val, { shouldValidate: true });
  };

  const onSubmit = async (data: ReviewFormData) => {
    if (rating === 0) {
      toast.error(REVIEW_COPY.SELECT_RATING);
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
      const created = json.data as Review;
      toast.success(REVIEW_COPY.SUBMITTED_TOAST, {
        description: REVIEW_COPY.SUBMITTED_TOAST_DESC,
      });
      setMyReview(created);
      reset();
      setRating(0);
      onSuccess?.(created);
    } catch (e) {
      toastError(e, APP_ERRORS.REVIEW_SUBMIT_FAILED);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return <div className="h-24 animate-pulse rounded-xl bg-muted/50" />;
  }

  if (myReview) {
    return <MyReviewStatus review={myReview} />;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-lg text-dark">
        {REVIEW_COPY.WRITE_TITLE}
      </h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label className="text-sm font-semibold text-dark mb-2 block">
          {REVIEW_COPY.RATING_LABEL}
        </Label>
        <StarRating rating={rating} size="lg" interactive onRate={handleRate} />
      </div>
      <div>
        <Label htmlFor="comment" className="text-sm font-semibold text-dark mb-2 block">
          {REVIEW_COPY.COMMENT_LABEL}
        </Label>
        <Textarea
          id="comment"
          placeholder={REVIEW_COPY.COMMENT_PLACEHOLDER}
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
        {loading ? REVIEW_COPY.SUBMITTING : REVIEW_COPY.SUBMIT}
      </Button>
      </form>
    </div>
  );
}
