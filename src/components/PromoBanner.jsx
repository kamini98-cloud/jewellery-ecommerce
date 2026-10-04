"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const BANNER_KEY = "adminBanners";

export default function PromoBanner() {
  const [banners, setBanners] = useState([]);

  // ================= LOAD PROMOTIONAL BANNERS =================

  useEffect(() => {
    const loadPromoBanners = () => {
      try {
        const stored =
          localStorage.getItem(BANNER_KEY);

        if (!stored) {
          setBanners([]);
          return;
        }

        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) {
          setBanners([]);
          return;
        }

        const promotionalBanners = parsed
          .filter(
            (banner) =>
              (banner.type || "hero") ===
                "promotional" &&
              banner.isActive !== false &&
              banner.image
          )
          .sort(
            (a, b) =>
              Number(a.displayOrder || 0) -
              Number(b.displayOrder || 0)
          );

        setBanners(promotionalBanners);
      } catch (error) {
        console.error(
          "Failed to load promotional banners:",
          error
        );

        setBanners([]);
      }
    };

    loadPromoBanners();
  }, []);

  // ================= NO PROMOTIONAL BANNER =================

  if (banners.length === 0) {
    return null;
  }

  // ================= BANNER =================

  const banner = banners[0];

  // ================= BANNER CONTENT =================

  const bannerContent = (
    <div className="relative min-h-[350px] overflow-hidden bg-gray-200 sm:min-h-[450px]">

      {/* ================= IMAGE ================= */}

      <img
        src={banner.image}
        alt={
          banner.title ||
          "Promotional Banner"
        }
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* ================= OVERLAY ================= */}

      <div className="absolute inset-0 bg-black/30" />

      {/* ================= CONTENT ================= */}

      {(banner.subtitle ||
        banner.title ||
        banner.buttonText) && (
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">

          <div className="max-w-xl text-white">

            {/* ================= SUBTITLE ================= */}

            {banner.subtitle && (
              <p className="text-xs uppercase tracking-[0.25em] sm:text-sm">
                {banner.subtitle}
              </p>
            )}

            {/* ================= TITLE ================= */}

            {banner.title && (
              <h2 className="mt-3 text-3xl font-semibold sm:text-4xl md:text-5xl">
                {banner.title}
              </h2>
            )}

            {/* ================= DESCRIPTION ================= */}

            {banner.description && (
              <p className="mx-auto mt-4 max-w-md text-sm text-white/90 sm:text-base">
                {banner.description}
              </p>
            )}

            {/* ================= BUTTON ================= */}

            {banner.buttonText && (
              <span className="mt-6 inline-block bg-white px-7 py-3 text-sm font-medium text-black transition hover:bg-gray-100 sm:px-9">
                {banner.buttonText}
              </span>
            )}

          </div>

        </div>
      )}

    </div>
  );

  // ================= CLICKABLE BANNER =================

  if (banner.buttonLink) {
    return (
      <section className="py-12 sm:py-16">

        {/* <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"> */}
<div className="mx-auto max-w-[1650px] px-4 sm:px-6 lg:px-8">
          <Link
            href={banner.buttonLink}
            className="block"
          >
            {bannerContent}
          </Link>

        </div>

      </section>
    );
  }

  // ================= NON-CLICKABLE BANNER =================

  return (
    <section className="py-12 sm:py-16">

      {/* <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"> */}
<div className="mx-auto max-w-[1650px] px-4 sm:px-6 lg:px-8">
        {bannerContent}

      </div>

    </section>
  );
}