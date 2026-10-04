"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BANNER_KEY = "adminBanners";

export default function Hero() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ================= LOAD HERO BANNERS =================

  useEffect(() => {
    const loadBanners = () => {
      try {
        const stored = localStorage.getItem(BANNER_KEY);

        if (!stored) {
          setBanners([]);
          return;
        }

        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) {
          setBanners([]);
          return;
        }

        const activeHeroBanners = parsed
          .filter(
            (banner) =>
              // Old banners without a type are treated as Hero
              (banner.type || "hero") === "hero" &&
              banner.isActive !== false &&
              banner.image
          )
          .sort(
            (a, b) =>
              Number(a.displayOrder || 0) -
              Number(b.displayOrder || 0)
          );

        setBanners(activeHeroBanners);
        setCurrentIndex(0);
      } catch (error) {
        console.error(
          "Failed to load hero banners:",
          error
        );

        setBanners([]);
      }
    };

    loadBanners();
  }, []);

  // ================= AUTO CAROUSEL =================

  useEffect(() => {
    // One banner = no carousel
    if (banners.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((current) =>
        current === banners.length - 1
          ? 0
          : current + 1
      );
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [banners.length]);

  // ================= PREVIOUS =================

  const handlePrevious = () => {
    setCurrentIndex((current) =>
      current === 0
        ? banners.length - 1
        : current - 1
    );
  };

  // ================= NEXT =================

  const handleNext = () => {
    setCurrentIndex((current) =>
      current === banners.length - 1
        ? 0
        : current + 1
    );
  };

  // ================= NO HERO BANNERS =================

  if (banners.length === 0) {
    return (
      <section className="relative w-full">
        <div className="flex h-[60vh] min-h-[450px] max-h-[750px] w-full items-center justify-center bg-gray-200">
          <p className="text-sm text-gray-500">
            No active hero banner available
          </p>
        </div>
      </section>
    );
  }

  const banner = banners[currentIndex];

  // ================= BANNER CONTENT =================

  const bannerContent = (
    <div className="relative h-[60vh] min-h-[450px] max-h-[750px] w-full bg-gray-200">

      {/* ================= IMAGE ================= */}

      <img
        src={banner.image}
        alt={
          banner.title ||
          "Jewellery Banner"
        }
        className="h-full w-full object-cover"
      />

      {/* ================= OVERLAY ================= */}

      <div className="absolute inset-0 bg-black/20" />

      {/* ================= HERO CONTENT ================= */}

      {(banner.subtitle ||
        banner.title ||
        banner.buttonText) && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">

          <div className="max-w-2xl">

            {/* ================= SUBTITLE ================= */}

            {banner.subtitle && (
              <p className="mb-3 text-sm uppercase tracking-[0.25em] text-white">
                {banner.subtitle}
              </p>
            )}

            {/* ================= TITLE ================= */}

            {banner.title && (
              <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                {banner.title}
              </h1>
            )}

            {/* ================= BUTTON ================= */}

            {banner.buttonText && (
              <span className="mt-6 inline-block bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-gray-800 sm:px-9">
                {banner.buttonText}
              </span>
            )}

          </div>

        </div>
      )}

      {/* ================= ARROWS ================= */}

      {banners.length > 1 && (
        <>
          {/* PREVIOUS */}

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handlePrevious();
            }}
            aria-label="Previous banner"
            className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-xl text-black shadow transition hover:bg-white"
          >
            ‹
          </button>

          {/* NEXT */}

          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleNext();
            }}
            aria-label="Next banner"
            className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-xl text-black shadow transition hover:bg-white"
          >
            ›
          </button>
        </>
      )}

      {/* ================= DOTS ================= */}

      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">

          {banners.map((item, index) => (
            <button
              key={item.id || index}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setCurrentIndex(index);
              }}
              aria-label={`Go to banner ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-white"
                  : "w-2.5 bg-white/60 hover:bg-white"
              }`}
            />
          ))}

        </div>
      )}

    </div>
  );

  // ================= CLICKABLE BANNER =================

  if (banner.buttonLink) {
    return (
      <section className="relative w-full overflow-hidden">

        <Link
          href={banner.buttonLink}
          className="block"
        >
          {bannerContent}
        </Link>

      </section>
    );
  }

  // ================= NON-CLICKABLE BANNER =================

  return (
    <section className="relative w-full overflow-hidden">
      {bannerContent}
    </section>
  );
}