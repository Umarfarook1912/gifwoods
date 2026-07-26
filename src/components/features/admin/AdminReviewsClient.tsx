"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "./DataTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { StarRating } from "@/components/shared/StarRating";
import { formatDate } from "@/lib/utils/formatters";
import { API_ENDPOINTS } from "@/constants/api";
import { CONFIRMATIONS } from "@/constants/confirmations";
import { useConfirm } from "@/hooks/useConfirm";
import { toast } from "sonner";
import { Check, X, Trash2, Search, MessageSquare, RefreshCw } from "lucide-react";
import type { Review } from "@/types/review";

interface Props {
  initialReviews: Review[];
}

export function AdminReviewsClient({ initialReviews }: Props) {
  const confirm = useConfirm();
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { setReviews(initialReviews); }, [initialReviews]);

  const handleRefresh = () => {
    setRefreshing(true);
    router.refresh();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Reply states
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (approvalFilter !== "all" && String(r.is_approved) !== approvalFilter) return false;
      if (ratingFilter !== "all" && r.rating !== parseInt(ratingFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        const product = r.product as { name: string } | undefined;
        const user = r.user as { name?: string; email?: string } | undefined;
        if (
          !r.comment.toLowerCase().includes(q) &&
          !product?.name?.toLowerCase().includes(q) &&
          !user?.name?.toLowerCase().includes(q) &&
          !user?.email?.toLowerCase().includes(q)
        )
          return false;
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
    if (!(await confirm(CONFIRMATIONS.REVIEW_DELETE))) return;
    const res = await fetch(API_ENDPOINTS.REVIEW(id), { method: "DELETE" });
    if (res.ok) {
      setReviews(reviews.filter((r) => r.id !== id));
      toast.success("Review deleted");
    }
  };

  const openReplyModal = (review: Review) => {
    setReplyingReviewId(review.id);
    setReplyText(review.admin_reply || "");
  };

  const saveReply = async () => {
    if (!replyingReviewId) return;
    setSubmittingReply(true);
    try {
      const res = await fetch(API_ENDPOINTS.REVIEW(replyingReviewId), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_reply: replyText.trim() || null }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Failed to save reply");

      setReviews(reviews.map((r) => r.id === replyingReviewId ? { ...r, admin_reply: replyText.trim() || null } : r));
      toast.success("Admin reply updated successfully!");
      setReplyingReviewId(null);
      setReplyText("");
    } catch (err: any) {
      toast.error(err.message || "Failed to save reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-dark">Reviews</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

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
          { key: "comment", label: "Comment & Admin Reply", render: (r) => (
            <div className="space-y-1 max-w-xs">
              <p className="text-xs text-secondary-dark">{r.comment}</p>
              {r.admin_reply && (
                <p className="text-[10px] text-gold font-medium bg-gold/5 px-2 py-0.5 rounded border border-gold/10 truncate">
                  Reply: {r.admin_reply}
                </p>
              )}
            </div>
          )},
          { key: "is_approved", label: "Status", render: (r) => (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.is_approved ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"}`}>
              {r.is_approved ? "Approved" : "Pending"}
            </span>
          )},
          { key: "created_at", label: "Date", render: (r) => <span className="text-xs text-warm-gray">{formatDate(r.created_at)}</span> },
          { key: "actions", label: "", render: (r) => (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-gold" onClick={() => openReplyModal(r)} title="Reply / Edit Reply">
                <MessageSquare className="h-3.5 w-3.5" />
              </Button>
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

      <Dialog open={replyingReviewId !== null} onOpenChange={(open) => !open && setReplyingReviewId(null)}>
        <DialogContent className="sm:max-w-md bg-white border border-border rounded-2xl shadow-lg p-6">
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-lg text-dark">Admin Reply</DialogTitle>
            <DialogDescription className="text-warm-gray text-xs">Write or edit your official reply to this review.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Write response from Gifwoods..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              className="resize-none border-border focus-visible:ring-gold"
            />
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setReplyingReviewId(null)} className="flex-1 sm:flex-none">Cancel</Button>
            <Button onClick={saveReply} disabled={submittingReply} className="flex-1 sm:flex-none bg-gold text-dark hover:bg-gold-dark font-semibold">
              {submittingReply ? "Saving..." : "Save Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
