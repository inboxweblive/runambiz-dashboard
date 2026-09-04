/* =========================================================
   RUNAMBIZ — REVIEWS MODERATION

   Save as: src/dashboard/pages/Reviews.jsx
========================================================= */

import { useCallback, useEffect, useState } from "react";

import {
  Check,
  Loader2,
  MessageSquare,
  Star,
  Trash2,
  X
} from "lucide-react";

import { supabase } from "../../lib/supabase";


export default function Reviews({ business, refreshKey }) {

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState("");


  const load = useCallback(async () => {

    if (!business?.id) return;

    setLoading(true);

    const { data, error: loadError } = await supabase
      .from("store_reviews")
      .select("*")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });

    if (loadError) {
      console.error("Reviews load error:", loadError);
      setError(loadError.message);
    } else {
      setReviews(data || []);
      setError("");
    }

    setLoading(false);

  }, [business?.id]);


  useEffect(() => {
    load();
  }, [load, refreshKey]);


  /* New reviews arrive while the merchant is looking at the
     page — no reason to make them refresh. */

  useEffect(() => {

    if (!business?.id) return;

    const channel = supabase
      .channel(`reviews-${business.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "store_reviews",
          filter: `business_id=eq.${business.id}`
        },
        load
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [business?.id, load]);


  async function setApproval(review, approved) {

    setBusyId(review.id);
    setError("");

    const { error: updateError } = await supabase
      .from("store_reviews")
      .update({
        is_approved: approved,
        is_rejected: !approved,
        approved_at: approved ? new Date().toISOString() : null
      })
      .eq("id", review.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await load();
    }

    setBusyId(null);

  }


  async function remove(review) {

    const ok = window.confirm(
      `Delete this review from ${review.customer_name}? This can't be undone.`
    );

    if (!ok) return;

    setBusyId(review.id);
    setError("");

    const { error: deleteError } = await supabase
      .from("store_reviews")
      .delete()
      .eq("id", review.id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      await load();
    }

    setBusyId(null);

  }


  const pending = reviews.filter(r => !r.is_approved && !r.is_rejected);
  const approved = reviews.filter(r => r.is_approved);
  const rejected = reviews.filter(r => r.is_rejected);

  const visible =
    filter === "pending"
      ? pending
      : filter === "approved"
        ? approved
        : rejected;


  const averageRating =
    approved.length
      ? approved.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
        approved.length
      : 0;


  if (loading && !reviews.length) {

    return (
      <main className="dashboard-content">
        <div className="reviews-loading">
          <Loader2 size={20} className="spin" />
          Loading reviews...
        </div>
      </main>
    );

  }


  return (

    <main className="dashboard-content reviews-page">

      <header className="reviews-header">

        <div>
          <span className="dashboard-eyebrow">Reputation</span>
          <h1>Reviews</h1>
          <p>
            Nothing appears on your storefront until you
            approve it.
          </p>
        </div>

      </header>


      <section className="reviews-summary">

        <div className="review-summary-card">
          <span>Waiting for you</span>
          <strong>{pending.length}</strong>
        </div>

        <div className="review-summary-card">
          <span>Published</span>
          <strong>{approved.length}</strong>
        </div>

        <div className="review-summary-card">
          <span>Average rating</span>
          <strong>
            {approved.length ? averageRating.toFixed(1) : "—"}
          </strong>
        </div>

      </section>


      <div className="reviews-tabs" role="group">

        <button
          type="button"
          className={filter === "pending" ? "active" : ""}
          onClick={() => setFilter("pending")}
        >
          Pending ({pending.length})
        </button>

        <button
          type="button"
          className={filter === "approved" ? "active" : ""}
          onClick={() => setFilter("approved")}
        >
          Published ({approved.length})
        </button>

        <button
          type="button"
          className={filter === "rejected" ? "active" : ""}
          onClick={() => setFilter("rejected")}
        >
          Hidden ({rejected.length})
        </button>

      </div>


      {error && (
        <div className="store-page-error">{error}</div>
      )}


      {!visible.length ? (

        <div className="reviews-empty">

          <MessageSquare size={28} />

          <strong>
            {filter === "pending"
              ? "Nothing waiting"
              : filter === "approved"
                ? "No published reviews yet"
                : "Nothing hidden"}
          </strong>

          <span>
            {filter === "pending"
              ? "New reviews from customers will appear here for you to approve."
              : filter === "approved"
                ? "Approve a pending review and it appears on your storefront."
                : "Reviews you hide are kept here rather than deleted."}
          </span>

        </div>

      ) : (

        <div className="reviews-list">

          {visible.map(review => (

            <article key={review.id} className="review-row">

              <div className="review-row-top">

                <div>
                  <strong>{review.customer_name}</strong>

                  <div className="review-row-stars">
                    {[1, 2, 3, 4, 5].map(index => (
                      <Star
                        key={index}
                        size={14}
                        className={index <= review.rating ? "is-filled" : ""}
                      />
                    ))}
                  </div>
                </div>

                <span>
                  {new Date(review.created_at).toLocaleDateString(
                    undefined,
                    { day: "numeric", month: "short", year: "numeric" }
                  )}
                </span>

              </div>


              {review.comment && (
                <p>{review.comment}</p>
              )}


              {review.customer_email && (
                <small>{review.customer_email}</small>
              )}


              <div className="review-row-actions">

                {!review.is_approved && (
                  <button
                    type="button"
                    className="review-approve"
                    disabled={busyId === review.id}
                    onClick={() => setApproval(review, true)}
                  >
                    <Check size={14} />
                    Publish
                  </button>
                )}

                {review.is_approved && (
                  <button
                    type="button"
                    className="review-hide"
                    disabled={busyId === review.id}
                    onClick={() => setApproval(review, false)}
                  >
                    <X size={14} />
                    Hide
                  </button>
                )}

                <button
                  type="button"
                  className="review-delete"
                  disabled={busyId === review.id}
                  onClick={() => remove(review)}
                >
                  <Trash2 size={14} />
                  Delete
                </button>

              </div>

            </article>

          ))}

        </div>

      )}

    </main>

  );

}
