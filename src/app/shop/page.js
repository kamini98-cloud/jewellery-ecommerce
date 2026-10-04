"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import ProductCard from "@/components/ProductCard";
import ShopFilters from "@/components/shop/ShopFilters";
import products from "@/data/products";

export default function ShopPage() {
  const searchParams = useSearchParams();

  // ================= URL PARAMETERS =================

  const collection = searchParams.get("collection");
  const categoryFromUrl = searchParams.get("category");

  // ================= FILTER STATES =================

  const [filters, setFilters] = useState({
    category: categoryFromUrl ? [categoryFromUrl] : [],
    color: [],
    material: [],
    occasion: [],
    gender: [],
  });

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [inStockOnly, setInStockOnly] = useState(false);

  const [discount, setDiscount] = useState("");

  // ================= SORT STATE =================

  const [sortBy, setSortBy] = useState("featured");

  // ================= FILTER + SORT PRODUCTS =================

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // ================= COLLECTION =================

    // Best Sellers
    if (collection === "bestsellers") {
      result = result.filter(
        (product) => product.isBestSeller
      );
    }

    // New Arrivals
    if (collection === "newarrivals") {
      result = result.filter(
        (product) => product.isNew
      );
    }

    // ================= FILTERS =================

    Object.keys(filters).forEach((key) => {
      if (filters[key].length > 0) {
        result = result.filter((product) =>
          filters[key].includes(product[key])
        );
      }
    });

    // ================= MIN PRICE =================

    if (minPrice !== "") {
      result = result.filter(
        (product) => product.price >= Number(minPrice)
      );
    }

    // ================= MAX PRICE =================

    if (maxPrice !== "") {
      result = result.filter(
        (product) => product.price <= Number(maxPrice)
      );
    }

    // ================= IN STOCK =================

    if (inStockOnly) {
      result = result.filter(
        (product) => product.inStock === true
      );
    }

    // ================= DISCOUNT =================

    if (discount !== "") {
      result = result.filter((product) => {
        if (!product.oldPrice) return false;

        const discountPercentage =
          ((product.oldPrice - product.price) /
            product.oldPrice) *
          100;

        return discountPercentage >= Number(discount);
      });
    }

    // ================= SORTING =================

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sortBy === "discount") {
      result.sort((a, b) => {
        const discountA = a.oldPrice
          ? ((a.oldPrice - a.price) / a.oldPrice) * 100
          : 0;

        const discountB = b.oldPrice
          ? ((b.oldPrice - b.price) / b.oldPrice) * 100
          : 0;

        return discountB - discountA;
      });
    }

    if (sortBy === "rating") {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [
    collection,
    filters,
    minPrice,
    maxPrice,
    inStockOnly,
    discount,
    sortBy,
  ]);

  // ================= CLEAR FILTERS =================

  const clearAllFilters = () => {
    setFilters({
      category: [],
      color: [],
      material: [],
      occasion: [],
      gender: [],
    });

    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setDiscount("");
    setSortBy("featured");
  };

  // ================= PAGE TITLE =================

  const pageTitle = categoryFromUrl
    ? categoryFromUrl
    : collection === "bestsellers"
    ? "Best Sellers"
    : collection === "newarrivals"
    ? "New Arrivals"
    : "Shop All";

  const pageSubtitle = categoryFromUrl
    ? `Explore ${categoryFromUrl}`
    : collection === "bestsellers"
    ? "Our Most Loved Jewellery"
    : collection === "newarrivals"
    ? "Fresh Styles Just For You"
    : "Discover Our Collection";

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

      {/* ================= HEADER ================= */}

      <div className="mb-10 text-center">

        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          {pageSubtitle}
        </p>

        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          {pageTitle}
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500">
          Explore our collection of jewellery designed for
          everyday elegance and special occasions.
        </p>

      </div>

      {/* ================= SHOP LAYOUT ================= */}

      <div className="flex flex-col gap-10 lg:flex-row">

        {/* ================= FILTER SIDEBAR ================= */}

        <ShopFilters
          filters={filters}
          setFilters={setFilters}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          discount={discount}
          setDiscount={setDiscount}
        />

        {/* ================= PRODUCTS AREA ================= */}

        <div className="min-w-0 flex-1">

          {/* ================= TOOLBAR ================= */}

          <div className="flex flex-col gap-4 border-y py-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-gray-500">
              Showing {filteredProducts.length}{" "}
              {filteredProducts.length === 1
                ? "product"
                : "products"}
            </p>

            {/* ================= SORT ================= */}

            <div className="flex items-center gap-3">

              <label
                htmlFor="sort"
                className="text-sm text-gray-500"
              >
                Sort by
              </label>

              <select
                id="sort"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
                className="border px-4 py-2 text-sm outline-none"
              >
                <option value="featured">
                  Featured
                </option>

                <option value="price-low">
                  Price: Low to High
                </option>

                <option value="price-high">
                  Price: High to Low
                </option>

                <option value="discount">
                  Biggest Discount
                </option>

                <option value="rating">
                  Highest Rated
                </option>
              </select>

            </div>

          </div>

          {/* ================= PRODUCTS ================= */}

          {filteredProducts.length > 0 ? (

            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">

              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}

            </div>

          ) : (

            /* ================= NO PRODUCTS ================= */

            <div className="py-20 text-center">

              <div className="text-5xl">
                🔍
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                No products found
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your filters.
              </p>

              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-6 bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Clear All Filters
              </button>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}