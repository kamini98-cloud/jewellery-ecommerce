"use client";

import { useEffect, useRef, useState } from "react";

const filterSections = [
  {
    title: "Category",
    key: "category",
    options: [
      "Earrings",
      "Necklaces",
      "Bangles",
      "Rings",
      "Bracelets",
    ],
  },
  {
    title: "Colour",
    key: "color",
    options: [
      "Gold",
      "Silver",
      "White",
      "Rose Gold",
      "Black",
      "Multicolour",
    ],
  },
  {
    title: "Material",
    key: "material",
    options: [
      "Gold Plated",
      "Silver Plated",
      "Alloy",
      "Kundan",
      "Pearl",
      "Oxidised Metal",
    ],
  },
  {
    title: "Occasion",
    key: "occasion",
    options: [
      "Wedding",
      "Festive",
      "Party",
      "Everyday",
      "Gifting",
    ],
  },
  {
    title: "Gender",
    key: "gender",
    options: [
      "Women",
      "Men",
      "Unisex",
    ],
  },
];

export default function ProductFilterDropdown({
  filters,
  setFilters,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  inStockOnly,
  setInStockOnly,
  discount,
  setDiscount,
  showCategory = true,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // ================= FILTER DROPDOWN REF =================

  const filterRef = useRef(null);

  // ================= CLOSE ON OUTSIDE CLICK =================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isOpen &&
        filterRef.current &&
        !filterRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [isOpen]);

  // ================= TOGGLE FILTER =================

  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      const currentValues = prev[key] || [];

      const updatedValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [key]: updatedValues,
      };
    });
  };

  // ================= CLEAR FILTERS =================

  const clearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      category: [],
      color: [],
      material: [],
      occasion: [],
      gender: [],
    }));

    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setDiscount("");
  };

  // ================= APPLY FILTERS =================

  const applyFilters = () => {
    setIsOpen(false);
  };

  return (
    <div
      ref={filterRef}
      className="relative"
    >
      {/* ================= FILTER BUTTON ================= */}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 border border-gray-300 px-5 py-3 text-sm font-medium transition hover:border-black"
      >
        <span>☰</span>

        Filter

        <span className="text-xs">▼</span>
      </button>

      {/* ================= FILTER DROPDOWN ================= */}

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[320px] border border-gray-200 bg-white shadow-xl">

          {/* ================= HEADER ================= */}

          <div className="flex items-center justify-between border-b px-5 py-4">

            <h2 className="font-semibold">
              Filters
            </h2>

            <button
              type="button"
              onClick={clearFilters}
              className="text-xs underline"
            >
              Clear All
            </button>

          </div>

          {/* ================= SCROLLABLE CONTENT ================= */}

          <div className="max-h-[65vh] overflow-y-auto px-5">

            {/* ================= PRICE ================= */}

            <div className="border-b py-5">

              <h3 className="mb-4 text-sm font-semibold">
                Price
              </h3>

              <div className="flex gap-3">

                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) =>
                    setMinPrice(e.target.value)
                  }
                  className="min-w-0 w-full border px-3 py-2 text-sm outline-none focus:border-black"
                />

                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(e.target.value)
                  }
                  className="min-w-0 w-full border px-3 py-2 text-sm outline-none focus:border-black"
                />

              </div>

            </div>

            {/* ================= FILTER SECTIONS ================= */}

            {filterSections
              .filter(
                (section) =>
                  showCategory ||
                  section.key !== "category"
              )
              .map((section) => (
                <div
                  key={section.key}
                  className="border-b py-5"
                >

                  <h3 className="mb-4 text-sm font-semibold">
                    {section.title}
                  </h3>

                  <div className="space-y-3">

                    {section.options.map((option) => (
                      <label
                        key={option}
                        className="flex cursor-pointer items-center gap-3 text-sm"
                      >

                        <input
                          type="checkbox"
                          checked={
                            filters[section.key]?.includes(
                              option
                            ) || false
                          }
                          onChange={() =>
                            toggleFilter(
                              section.key,
                              option
                            )
                          }
                          className="h-4 w-4 accent-black"
                        />

                        <span>
                          {option}
                        </span>

                      </label>
                    ))}

                  </div>

                </div>
              ))}

            {/* ================= AVAILABILITY ================= */}

            <div className="border-b py-5">

              <h3 className="mb-4 text-sm font-semibold">
                Availability
              </h3>

              <label className="flex cursor-pointer items-center gap-3 text-sm">

                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) =>
                    setInStockOnly(e.target.checked)
                  }
                  className="h-4 w-4 accent-black"
                />

                <span>
                  In Stock
                </span>

              </label>

            </div>

            {/* ================= DISCOUNT ================= */}

            <div className="py-5">

              <h3 className="mb-4 text-sm font-semibold">
                Discount
              </h3>

              <div className="space-y-3">

                {[10, 20, 30, 40, 50].map((value) => (
                  <label
                    key={value}
                    className="flex cursor-pointer items-center gap-3 text-sm"
                  >

                    <input
                      type="radio"
                      name="discount"
                      checked={
                        Number(discount) === value
                      }
                      onChange={() =>
                        setDiscount(value)
                      }
                      className="accent-black"
                    />

                    <span>
                      {value}% or more
                    </span>

                  </label>
                ))}

              </div>

            </div>

          </div>

          {/* ================= FOOTER ================= */}

          <div className="flex gap-3 border-t p-4">

            <button
              type="button"
              onClick={clearFilters}
              className="flex-1 border border-black py-3 text-sm font-medium transition hover:bg-gray-100"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={applyFilters}
              className="flex-1 bg-black py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Apply Filters
            </button>

          </div>

        </div>
      )}

    </div>
  );
}