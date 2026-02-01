"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { reviews } from "./reviewsData";
import { useTranslations, useLocale } from "next-intl";
import { useCurrentFunnel } from "@/lib/funnels/funnelContext";
import "./widget.css";
type SortOption = "najlepszych" | "najgorszych" | "najnowszych" | "najstarszych";

export default function ReviewsWidget() {
  const t = useTranslations('ReviewsWidget');
  const locale = useLocale();
  const currentFunnel = useCurrentFunnel();
  const [sortBy, setSortBy] = useState<SortOption>("najlepszych");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter reviews by language and funnel to match user's locale and current funnel
  const filteredReviews = reviews.filter((r) =>
    r.language && r.language.toLowerCase() === locale.toLowerCase() &&
    r.funnel && r.funnel === currentFunnel
  );

  // Calculate average rating
  const averageRating = (
    filteredReviews.reduce((sum, review) => sum + review.rating, 0) / (filteredReviews.length || 1)
  ).toFixed(1);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sort reviews based on selected option
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case "najlepszych":
        return b.rating - a.rating;
      case "najgorszych":
        return a.rating - b.rating;
      case "najnowszych":
        return b.date.getTime() - a.date.getTime();
      case "najstarszych":
        return a.date.getTime() - b.date.getTime();
      default:
        return 0;
    }
  });

  // Preserve the scroll position when reordering reviews
  const reviewsWindowRef = useRef<HTMLDivElement>(null);

  const handleSortChange = (newSortBy: SortOption) => {
    const reviewsWindow = reviewsWindowRef.current;
    const scrollTop = reviewsWindow ? reviewsWindow.scrollTop : 0; // Save current scroll position

    setSortBy(newSortBy);

    setTimeout(() => {
      if (reviewsWindow) {
        reviewsWindow.scrollTop = scrollTop; // Restore scroll position after sorting
      }
    }, 0);
  };

  // Ensure the sorted reviews are rendered at the top without scrolling
  const reorderedReviews = sortedReviews;

  const renderStars = (rating: number, size: "large" | "small" = "large") => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const className = size === "large" ? "star-icon" : "star-icon-small";

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Image
          key={`full-${i}`}
          src="/reviews/full.svg"
          alt="full star"
          width={size === "large" ? 23 : 16}
          height={size === "large" ? 22 : 15}
          className={className}
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Image
          key="half"
          src="/reviews/half.svg"
          alt="half star"
          width={size === "large" ? 23 : 16}
          height={size === "large" ? 22 : 15}
          className={className}
        />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Image
          key={`empty-${i}`}
          src="/reviews/empty.svg"
          alt="empty star"
          width={size === "large" ? 23 : 16}
          height={size === "large" ? 22 : 15}
          className={className}
        />
      );
    }

    return stars;
  };

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "najlepszych", label: t('sort_best') },
    { value: "najgorszych", label: t('sort_worst') },
    { value: "najnowszych", label: t('sort_newest') },
    { value: "najstarszych", label: t('sort_oldest') },
  ];

  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label || t('sort_best');

  return (
    <div className="reviews-widget">
      <div className="reviews-header">
        <h2 className="reviews-title">
          {t('title')}
        </h2>

        <div className="reviews-rating">
          <div className="reviews-stars">{renderStars(parseFloat(averageRating))}</div>
          <div className="reviews-score">{averageRating}{t('of5')}</div>
        </div>

        <div className="reviews-sort" ref={dropdownRef}>
          <button
            className={`sort-button ${isDropdownOpen ? "open" : ""}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {currentSortLabel}
          </button>

          {isDropdownOpen && (
            <div className="sort-dropdown">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  className={`sort-option ${sortBy === option.value ? "active" : ""}`}
                  onClick={() => {
                    handleSortChange(option.value);
                    setIsDropdownOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="reviews-divider" />

      <div className="reviews-window" aria-label={t('aria_label')} role="region" ref={reviewsWindowRef}>
        <div className="reviews-track">
          {reorderedReviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-avatar">
                <Image
                  src="/reviews/avatar.svg"
                  alt={review.name}
                  width={32}
                  height={32}
                />
              </div>

              <div className="review-content">
                <div className="review-header">
                  <h3 className="review-name">
                    {review.name} ({review.age} {t('age_suffix')})
                  </h3>
                  <div className="review-stars-small">
                    {renderStars(review.rating, "small")}
                  </div>
                  {review.verified && (
                    <span className="review-verified">{t('verified')}</span>
                  )}
                </div>

                <p className="review-text">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
