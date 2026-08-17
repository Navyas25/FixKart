import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Star, Loader2, Trash2, PenLine } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "../../lib/api";
import { useAuth } from "../../lib/auth";
import { formatDate } from "../../lib/format";
import { EmptyState } from "./PageHeader";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  profile?: { full_name?: string; avatar_url?: string } | null;
}

function Stars({ rating, interactive, onChange }: {
  rating: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
}) {
  return (
    <div className={`flex items-center gap-0.5 ${interactive ? "" : "cursor-default"}`} role={interactive ? "radiogroup" : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(value)}
          aria-label={`${value} star${value === 1 ? "" : "s"}`}
          className={interactive ? "transition-transform hover:scale-125" : ""}
        >
          <Star
            className={`w-4 h-4 ${
              value <= rating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-[#CBD5E1] dark:text-white/20"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewsSection({ itemType, itemId }: {
  itemType: "product" | "service";
  itemId: string;
}) {
  const { isLoggedIn, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Write form
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = () => {
    apiGet<{ reviews: Review[]; average: number }>(
      `/reviews?type=${itemType}&item_id=${itemId}`
    )
      .then((data) => {
        setReviews(data.reviews || []);
        setAverage(Number(data.average) || 0);
      })
      .catch((err) => setError(err.message || "Could not load reviews."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemType, itemId]);

  const myReview = reviews.find((r) => r.user_id === user?.id);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!myComment.trim()) {
      setFormError("Please write a short comment before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      await apiPost("/reviews", {
        item_type: itemType,
        item_id: itemId,
        rating: myRating,
        comment: myComment.trim(),
      });
      setMyComment("");
      setMyRating(5);
      load();
    } catch (err: any) {
      setFormError(err.message || "Could not submit your review.");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    try {
      await apiDelete(`/reviews/${id}`);
      load();
    } catch (err: any) {
      setError(err.message || "Could not delete the review.");
    }
  };

  const inputClass =
    "w-full bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/15 text-[#0F172A] dark:text-white text-sm font-medium px-4 py-3 rounded-xl outline-none focus:border-[#2563EB] transition-colors placeholder-gray-400";

  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] dark:text-white mb-1">
            Customer Reviews
          </h2>
          <div className="flex items-center gap-2">
            <Stars rating={Math.round(average)} />
            <span className="text-sm font-extrabold text-[#0F172A] dark:text-white">
              {average > 0 ? average.toFixed(1) : "New"}
            </span>
            <span className="text-xs text-[#64748B] dark:text-slate-400">
              ({reviews.length} review{reviews.length === 1 ? "" : "s"})
            </span>
          </div>
        </div>
      </div>

      {/* Write / update review */}
      {isLoggedIn ? (
        <form onSubmit={submit} className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 mb-8">
          <p className="text-sm font-bold text-[#0F172A] dark:text-white mb-2 flex items-center gap-2">
            <PenLine className="w-4 h-4 text-[#2563EB]" />
            {myReview ? "Update your review" : "Write a review"}
          </p>
          <div className="flex items-center gap-3 mb-3">
            <Stars rating={myRating} interactive onChange={setMyRating} />
            <span className="text-xs font-bold text-[#64748B]">{myRating}/5</span>
          </div>
          <textarea
            value={myComment}
            onChange={(e) => setMyComment(e.target.value)}
            placeholder={myReview ? "Tell us more about your experience…" : "Share what you liked (or didn't) about this product/service…"}
            rows={3}
            className={inputClass}
            maxLength={1000}
          />
          {formError && (
            <div className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl px-4 py-2.5">
              {formError}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 flex items-center gap-2 bg-[#2563EB] text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors disabled:opacity-60"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {myReview ? "Update Review" : "Submit Review"}
          </button>
        </form>
      ) : (
        <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10 mb-8 text-center">
          <p className="text-sm text-[#64748B] dark:text-slate-400 mb-3">
            Sign in to rate and review this {itemType === "product" ? "product" : "service"}.
          </p>
          <Link
            to={`/login?next=${encodeURIComponent(window.location.pathname)}`}
            className="inline-block bg-[#2563EB] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-blue-500 transition-colors"
          >
            Sign In to Review
          </Link>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-100 dark:border-white/10 p-5 animate-pulse">
              <div className="h-4 bg-slate-100 rounded-full w-1/4 mb-3" />
              <div className="h-14 bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState icon="⚠️" title="Couldn't load reviews" message={error} />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="No reviews yet"
          message="Be the first to review this item and help other customers decide."
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-gray-100 dark:border-white/10">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#F59E0B]/15 text-[#D97706] flex items-center justify-center text-sm font-extrabold flex-shrink-0">
                    {(review.profile?.full_name || "C").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#0F172A] dark:text-white truncate">
                      {review.profile?.full_name || "FixKart Customer"}
                    </p>
                    <p className="text-[11px] text-[#64748B] dark:text-slate-400">
                      {formatDate(review.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Stars rating={review.rating} />
                  {review.user_id === user?.id && (
                    <button
                      onClick={() => remove(review.id)}
                      aria-label="Delete my review"
                      className="p-1.5 text-[#64748B] hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-[#475569] dark:text-slate-300 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
