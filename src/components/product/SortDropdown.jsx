"use client";

import { useState } from "react";

export default function SortDropdown({
  sortBy,
  setSortBy,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    {
      label: "Featured",
      value: "featured",
    },
    {
      label: "Price: Low to High",
      value: "price-low",
    },
    {
      label: "Price: High to Low",
      value: "price-high",
    },
    {
      label: "Biggest Discount",
      value: "discount",
    },
    {
      label: "Highest Rated",
      value: "rating",
    },
  ];

  const selectedOption =
    sortOptions.find(
      (option) => option.value === sortBy
    )?.label || "Featured";

  const handleSortChange = (value) => {
    setSortBy(value);
    setIsOpen(false);
  };

  return (
    <div className="relative">

      {/* SORT BUTTON */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 border border-gray-300 px-5 py-3 text-sm font-medium transition hover:border-black"
      >
        <span>⇅</span>

        <span>
          Sort: {selectedOption}
        </span>

        <span className="text-xs">
          ▼
        </span>
      </button>

      {/* SORT DROPDOWN */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[230px] border border-gray-200 bg-white py-2 shadow-xl">

          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                handleSortChange(option.value)
              }
              className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition hover:bg-gray-50 ${
                sortBy === option.value
                  ? "font-semibold"
                  : ""
              }`}
            >
              {option.label}

              {sortBy === option.value && (
                <span>✓</span>
              )}
            </button>
          ))}

        </div>
      )}

    </div>
  );
}