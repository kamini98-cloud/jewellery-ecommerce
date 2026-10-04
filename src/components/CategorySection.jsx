"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CATEGORY_KEY = "adminCategories";

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ================= LOAD ADMIN CATEGORIES =================

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CATEGORY_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setCategories(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }

    setIsLoaded(true);
  }, []);

  // ================= ACTIVE CATEGORIES =================

  const activeCategories = categories
    .filter(
      (category) =>
        category &&
        category.isActive !== false
    )
    .sort(
      (a, b) =>
        Number(a.displayOrder || 0) -
        Number(b.displayOrder || 0)
    );

  // ================= LOADING =================

  if (!isLoaded) {
    return (
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-[1650px] px-4 sm:px-6 lg:px-8">

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              Shop By Category
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Explore our collections
            </p>
          </div>

        </div>
      </section>
    );
  }

  // ================= NO CATEGORIES =================

  if (activeCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-[1650px] px-4 sm:px-6 lg:px-8">

        {/* ================= HEADING ================= */}

        <div className="mb-8 text-center">

          <h2 className="text-2xl font-semibold sm:text-3xl">
            Shop By Category
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Explore our collections
          </p>

        </div>

        {/* ================= CATEGORIES ================= */}

        <div className="flex gap-6 overflow-x-auto pb-4 md:grid md:grid-cols-6 md:gap-8 md:overflow-visible">

          {activeCategories.map((category) => {

            return (
              <Link
                key={category.id}
                href={`/shop?category=${encodeURIComponent(
                  category.name
                )}`}
                className="group flex min-w-[100px] flex-shrink-0 flex-col items-center"
              >

                {/* ================= CATEGORY IMAGE ================= */}

                <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-100 sm:h-28 sm:w-28 md:h-32 md:w-32">

                  {category.image ? (

                    <img
                      src={category.image}
                      alt={category.name || "Category"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />

                  ) : (

                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      No Image
                    </div>

                  )}

                </div>

                {/* ================= CATEGORY NAME ================= */}

                <p className="mt-3 text-center text-sm font-medium">
                  {category.name}
                </p>

              </Link>
            );
          })}

        </div>

      </div>
    </section>
  );
}