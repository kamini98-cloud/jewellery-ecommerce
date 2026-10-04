"use client";

import { useMemo, useState } from "react";

const REVIEW_STORAGE_KEY = "productReviews";

function getStoredReviews() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const stored = localStorage.getItem(
      REVIEW_STORAGE_KEY
    );

    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored);

    return parsed && typeof parsed === "object"
      ? parsed
      : {};
  } catch (error) {
    console.error(
      "Failed to load reviews:",
      error
    );

    return {};
  }
}

function StarRating({
  rating = 0,
  size = "text-lg",
}) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${size} ${
            star <= rating
              ? "text-yellow-500"
              : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function RatingInput({
  value,
  onChange,
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`Give ${star} star${
            star > 1 ? "s" : ""
          }`}
          className={`text-3xl leading-none transition ${
            star <= value
              ? "text-yellow-500"
              : "text-gray-300 hover:text-yellow-400"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({
  product,
}) {
  const productId = String(product.id);

  const [reviews, setReviews] = useState(() => {
    const allReviews = getStoredReviews();

    return Array.isArray(allReviews[productId])
      ? allReviews[productId]
      : [];
  });

  const [showReviewForm, setShowReviewForm] =
    useState(false);

  const [rating, setRating] = useState(0);

  const [reviewText, setReviewText] =
    useState("");

  const [reviewName, setReviewName] =
    useState("");

  const [formError, setFormError] =
    useState("");

  const [submitted, setSubmitted] =
    useState(false);

  const calculatedRating = useMemo(() => {
    if (reviews.length === 0) {
      return Number(product.rating) || 0;
    }

    const total = reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating || 0),
      0
    );

    return total / reviews.length;
  }, [reviews, product.rating]);

  const ratingCount = useMemo(() => {
    if (reviews.length > 0) {
      return reviews.length;
    }

    return Number(product.reviews) || 0;
  }, [reviews, product.reviews]);

  const ratingDistribution = useMemo(() => {
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    reviews.forEach((review) => {
      const reviewRating = Number(
        review.rating
      );

      if (
        reviewRating >= 1 &&
        reviewRating <= 5
      ) {
        distribution[reviewRating]++;
      }
    });

    return distribution;
  }, [reviews]);

  const saveReviews = (updatedReviews) => {
    const allReviews = getStoredReviews();

    allReviews[productId] =
      updatedReviews;

    localStorage.setItem(
      REVIEW_STORAGE_KEY,
      JSON.stringify(allReviews)
    );

    setReviews(updatedReviews);
  };

  const handleSubmitReview = (
    event
  ) => {
    event.preventDefault();

    setFormError("");
    setSubmitted(false);

    if (!reviewName.trim()) {
      setFormError(
        "Please enter your name."
      );
      return;
    }

    if (rating === 0) {
      setFormError(
        "Please select a rating."
      );
      return;
    }

    if (!reviewText.trim()) {
      setFormError(
        "Please write your review."
      );
      return;
    }

    if (reviewText.trim().length < 10) {
      setFormError(
        "Review must contain at least 10 characters."
      );
      return;
    }

    const newReview = {
      id:
        typeof crypto !== "undefined" &&
        crypto.randomUUID
          ? crypto.randomUUID()
          : `review-${Date.now()}`,

      name: reviewName.trim(),

      rating,

      text: reviewText.trim(),

      createdAt:
        new Date().toISOString(),
    };

    const updatedReviews = [
      newReview,
      ...reviews,
    ];

    saveReviews(updatedReviews);

    setReviewName("");
    setRating(0);
    setReviewText("");
    setFormError("");
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  return (
    <section className="mt-16 border-t border-gray-200 pt-12">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Customer Feedback
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-gray-900">
            Reviews & Ratings
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            See what customers are saying about this product.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowReviewForm(
              (current) => !current
            );

            setFormError("");
            setSubmitted(false);
          }}
          className="border border-black bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black"
        >
          {showReviewForm
            ? "Close Review"
            : "Write a Review"}
        </button>

      </div>

      {/* =================================================
          RATING SUMMARY
      ================================================= */}

      <div className="mt-8 grid grid-cols-1 gap-6 border border-gray-200 p-6 md:grid-cols-3">

        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center border-b pb-6 md:border-b-0 md:border-r md:pb-0">

          <p className="text-5xl font-semibold text-gray-900">
            {calculatedRating > 0
              ? calculatedRating.toFixed(1)
              : "0.0"}
          </p>

          <div className="mt-2">
            <StarRating
              rating={Math.round(
                calculatedRating
              )}
              size="text-xl"
            />
          </div>

          <p className="mt-2 text-sm text-gray-500">
            {ratingCount}{" "}
            {ratingCount === 1
              ? "review"
              : "reviews"}
          </p>

        </div>

        {/* Rating Distribution */}
        <div className="md:col-span-2">

          <div className="space-y-3">

            {[5, 4, 3, 2, 1].map(
              (star) => {
                const count =
                  ratingDistribution[
                    star
                  ];

                const percentage =
                  reviews.length > 0
                    ? (count /
                        reviews.length) *
                      100
                    : 0;

                return (
                  <div
                    key={star}
                    className="flex items-center gap-3"
                  >

                    <span className="w-10 text-sm text-gray-600">
                      {star} ★
                    </span>

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-yellow-400 transition-all"
                        style={{
                          width: `${percentage}%`,
                        }}
                      ></div>
                    </div>

                    <span className="w-8 text-right text-xs text-gray-500">
                      {count}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </div>

      </div>

      {/* =================================================
          REVIEW FORM
      ================================================= */}

      {showReviewForm && (
        <div className="mt-8 border border-gray-200 bg-gray-50 p-6">

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Write Your Review
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Share your experience with this product.
            </p>
          </div>

          <form
            onSubmit={handleSubmitReview}
            className="space-y-5"
          >

            {/* NAME */}
            <div>

              <label
                htmlFor={`reviewName-${productId}`}
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Your Name
              </label>

              <input
                id={`reviewName-${productId}`}
                type="text"
                value={reviewName}
                onChange={(event) =>
                  setReviewName(
                    event.target.value
                  )
                }
                placeholder="Enter your name"
                maxLength={50}
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              />

            </div>

            {/* RATING */}
            <div>

              <label className="mb-2 block text-sm font-medium text-gray-800">
                Your Rating
              </label>

              <RatingInput
                value={rating}
                onChange={setRating}
              />

            </div>

            {/* REVIEW */}
            <div>

              <label
                htmlFor={`reviewText-${productId}`}
                className="mb-2 block text-sm font-medium text-gray-800"
              >
                Your Review
              </label>

              <textarea
                id={`reviewText-${productId}`}
                value={reviewText}
                onChange={(event) =>
                  setReviewText(
                    event.target.value
                  )
                }
                placeholder="Write your review..."
                rows={5}
                maxLength={500}
                className="w-full resize-none border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              />

              <p className="mt-1 text-right text-xs text-gray-400">
                {reviewText.length}/500
              </p>

            </div>

            {/* ERROR */}
            {formError && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {formError}
              </div>
            )}

            {/* SUCCESS */}
            {submitted && (
              <div className="border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Thank you! Your review has been added.
              </div>
            )}

            {/* SUBMIT */}
            <div className="flex justify-end">

              <button
                type="submit"
                className="bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Submit Review
              </button>

            </div>

          </form>

        </div>
      )}

      {/* =================================================
          REVIEW LIST
      ================================================= */}

      <div className="mt-10">

        <div className="mb-5 flex items-center justify-between">

          <h3 className="text-lg font-semibold text-gray-900">
            Customer Reviews
          </h3>

          <span className="text-sm text-gray-500">
            {reviews.length}{" "}
            {reviews.length === 1
              ? "review"
              : "reviews"}
          </span>

        </div>

        {reviews.length > 0 ? (

          <div className="divide-y divide-gray-200 border-y border-gray-200">

            {reviews.map(
              (review) => (
                <article
                  key={review.id}
                  className="py-6"
                >

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                    <div>

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
                          {review.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "U"}
                        </div>

                        <div>

                          <p className="font-medium text-gray-900">
                            {review.name}
                          </p>

                          <p className="text-xs text-gray-400">
                            {formatReviewDate(
                              review.createdAt
                            )}
                          </p>

                        </div>

                      </div>

                    </div>

                    <StarRating
                      rating={Number(
                        review.rating
                      )}
                      size="text-base"
                    />

                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-600">
                    {review.text}
                  </p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">

                    <span>
                      Was this review helpful?
                    </span>

                    <button
                      type="button"
                      className="border border-gray-200 px-3 py-1.5 text-gray-600 hover:border-black hover:text-black"
                    >
                      👍 Yes
                    </button>

                    <button
                      type="button"
                      className="border border-gray-200 px-3 py-1.5 text-gray-600 hover:border-black hover:text-black"
                    >
                      👎 No
                    </button>

                  </div>

                </article>
              )
            )}

          </div>

        ) : (

          <div className="border border-dashed border-gray-300 py-12 text-center">

            <div className="text-4xl text-gray-300">
              ★
            </div>

            <h4 className="mt-3 font-medium text-gray-700">
              No customer reviews yet
            </h4>

            <p className="mt-1 text-sm text-gray-500">
              Be the first to review this product.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowReviewForm(true)
              }
              className="mt-5 text-sm font-medium underline underline-offset-4"
            >
              Write the first review
            </button>

          </div>

        )}

      </div>

    </section>
  );
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatReviewDate(
  dateValue
) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}