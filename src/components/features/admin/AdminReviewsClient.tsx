"use client";

import { useState, useMemo } from "react";
import { DataTable } from "./DataTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/shared/StarRating";
import { formatDate } from "@/lib/utils/formatters";
import { API_ENDPOINTS } from "@/constants/api";
import { toast } from "sonner";
import { Check, X, Trash2, Search } from "lucide-react";
import type { Review } from "@/types/review";

interface Props {
  initialReviews: Review[];
}

export function AdminReviewsClient({ initialReviews }: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (approvalFilter !== "all" && String(r.is_approved) !== approvalFilter) return false;
      if (ratingFilter !== "all" && r.rating !== parseInt(ratingFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        const product = r.product as { name: string } | undefined;
        if (!r.comment.toLowerCase().includes(q) && !product?.name?.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [reviews, search, approvalFilter, ratingFilter]);

  const toggleApproval = async (review: Review) => {
    const res = await fetch(API_ENDPOINTS.REVIEW(review.id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_approved: !review.is_approved }),
    });
    if (res.ok) {
      setReviews(reviews.map((r) => r.id === review.id ? { ...r, is_approved: !r.is_approved } : r));
      toast.success(review.is_approved ? "Review unapproved" : "Review approved!");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    const res = await fetch(API_ENDPOINTS.REVIEW(id), { method: "DELETE" });
    if (res.ok) {
      setReviews(reviews.filter((r) => r.id !== id));
      toast.success("Review deleted");
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="font-display text-2xl font-bold text-dark mb-6">Reviews</h1>

      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={approvalFilter} onValueChange={(v) => v && setApprovalFilter(v)}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Approval" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="false">Pending</SelectItem>
            <SelectItem value="true">Approved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={ratingFilter} onValueChange={(v) => v && setRatingFilter(v)}>
          <SelectTrigger className="w-28"><SelectValue placeholder="Rating" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            {[5, 4, 3, 2, 1].map((r) => <SelectItem key={r} value={String(r)}>{r} ★</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={[
          { key: "product", label: "Product", render: (r) => {
            const product = r.product as { name: string } | undefined;
            return <p className="text-sm font-medium max-w-[160px] truncate">{product?.name ?? "—"}</p>;
          }},
          { key: "user", label: "Customer", render: (r) => {
            const user = r.user as { name: string; email: string } | undefined;
            return <p className="text-xs text-warm-gray">{user?.name ?? user?.email ?? "—"}</p>;
          }},
          { key: "rating", label: "Rating", render: (r) => <StarRating rating={r.rating} size="sm" /> },
          { key: "comment", label: "Comment", render: (r) => (
            <p className="text-xs text-secondary-dark max-w-xs truncate">{r.comment}</p>
          )},
          { key: "is_approved", label: "Status", render: (r) => (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.is_approved ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
              {r.is_approved ? "Approved" : "Pending"}
            </span>
          )},
          { key: "created_at", label: "Date", render: (r) => <span className="text-xs text-warm-gray">{formatDate(r.created_at)}</span> },
          { key: "actions", label: "", render: (r) => (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className={`h-8 w-8 ${r.is_approved ? "hover:text-yellow-600" : "hover:text-emerald-600"}`} onClick={() => toggleApproval(r)} title={r.is_approved ? "Unapprove" : "Approve"}>
                {r.is_approved ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => handleDelete(r.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          )},
        ]}
        data={filtered}
        keyExtractor={(r) => r.id}
        total={filtered.length}
        emptyMessage="No reviews found"
      />
    </div>
  );
}
