"use client";

import { useEffect, useMemo, useState } from "react";

import Hero from "@/components/Hero";
import CategorySection from "@/components/CategorySection";
import PromoBanner from "@/components/PromoBanner";
import NewArrivals from "@/components/NewArrivals";
import ProductCard from "@/components/ProductCard";

import ProductFilterDropdown from "@/components/product/ProductFilterDropdown";
import SortDropdown from "@/components/product/SortDropdown";

import defaultProducts from "@/data/products";

const PRODUCT_KEY = "adminProducts";

export default function Home() {
  // ================= PRODUCT STATE =================

  const [allProducts, setAllProducts] = useState(
    defaultProducts
  );

  // ================= LOAD ADMIN PRODUCTS =================

  useEffect(() => {
    try {
      const savedProducts =
        localStorage.getItem(PRODUCT_KEY);

      if (savedProducts) {
        const parsedProducts =
          JSON.parse(savedProducts);

        if (Array.isArray(parsedProducts)) {
          setAllProducts(parsedProducts);
        } else {
          setAllProducts(defaultProducts);
        }
      } else {
        setAllProducts(defaultProducts);
      }
    } catch (error) {
      console.error(
        "Failed to load admin products:",
        error
      );

      setAllProducts(defaultProducts);
    }
  }, []);

  // ================= FILTER STATES =================

  const [filters, setFilters] = useState({
    category: [],
    color: [],
    material: [],
    occasion: [],
    gender: [],
  });

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [inStockOnly, setInStockOnly] =
    useState(false);

  const [discount, setDiscount] =
    useState("");

  // ================= SORT STATE =================

  const [sortBy, setSortBy] =
    useState("featured");

  // ================= FILTER + SORT PRODUCTS =================

  const filteredProducts = useMemo(() => {
    // ================= REGULAR PRODUCTS =================
    // Use the Regular Product checkbox from Admin.
    //
    // A product can also be New and Best Seller
    // at the same time and still appear here
    // if isRegular === true.

    let result = allProducts.filter(
      (product) =>
        product.isRegular === true
    );

    // ================= CATEGORY =================

    if (filters.category.length > 0) {
      result = result.filter((product) =>
        filters.category.includes(
          product.category
        )
      );
    }

    // ================= COLOR =================

    if (filters.color.length > 0) {
      result = result.filter((product) =>
        filters.color.includes(
          product.color
        )
      );
    }

    // ================= MATERIAL =================

    if (filters.material.length > 0) {
      result = result.filter((product) =>
        filters.material.includes(
          product.material
        )
      );
    }

    // ================= OCCASION =================

    if (filters.occasion.length > 0) {
      result = result.filter((product) =>
        filters.occasion.includes(
          product.occasion
        )
      );
    }

    // ================= GENDER =================

    if (filters.gender.length > 0) {
      result = result.filter((product) =>
        filters.gender.includes(
          product.gender
        )
      );
    }

    // ================= MIN PRICE =================

    if (minPrice !== "") {
      result = result.filter(
        (product) =>
          Number(product.price) >=
          Number(minPrice)
      );
    }

    // ================= MAX PRICE =================

    if (maxPrice !== "") {
      result = result.filter(
        (product) =>
          Number(product.price) <=
          Number(maxPrice)
      );
    }

    // ================= IN STOCK =================

    if (inStockOnly) {
      result = result.filter(
        (product) =>
          product.inStock === true
      );
    }

    // ================= DISCOUNT =================

    if (discount !== "") {
      result = result.filter((product) => {
        if (!product.oldPrice) {
          return false;
        }

        const productDiscount =
          ((product.oldPrice -
            product.price) /
            product.oldPrice) *
          100;

        return (
          productDiscount >=
          Number(discount)
        );
      });
    }

    // ================= SORTING =================

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price) -
          Number(b.price)
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price) -
          Number(a.price)
      );
    }

    if (sortBy === "discount") {
      result.sort((a, b) => {
        const discountA = a.oldPrice
          ? ((a.oldPrice - a.price) /
              a.oldPrice) *
            100
          : 0;

        const discountB = b.oldPrice
          ? ((b.oldPrice - b.price) /
              b.oldPrice) *
            100
          : 0;

        return discountB - discountA;
      });
    }

    if (sortBy === "rating") {
      result.sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );
    }

    return result;
  }, [
    allProducts,
    filters,
    minPrice,
    maxPrice,
    inStockOnly,
    discount,
    sortBy,
  ]);

  // ================= CLEAR FILTERS =================

  const clearFilters = () => {
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

  return (
    <>
      {/* ================= HERO ================= */}

      <Hero />

      {/* ================= CATEGORIES ================= */}

      <CategorySection />

      {/* ================= MAIN PRODUCT COLLECTION ================= */}

      <section className="py-12 sm:py-16">

        <div className="mx-auto max-w-[1650px] px-4 sm:px-6 lg:px-8">

          {/* ================= HEADING ================= */}

          <div className="text-center">

            <p className="text-xs uppercase tracking-widest text-gray-500">
              Our Collection
            </p>

            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              Shop Our Collection
            </h2>

          </div>

          {/* ================= FILTER + SORT ================= */}

          <div className="mt-10 border-y border-gray-200">

            <div className="flex items-center justify-between py-4">

              <ProductFilterDropdown
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

              <SortDropdown
                sortBy={sortBy}
                setSortBy={setSortBy}
              />

            </div>

          </div>

          {/* ================= PRODUCT COUNT ================= */}

          <p className="mt-4 text-sm text-gray-500">
            Showing{" "}
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "product"
              : "products"}
          </p>

          {/* ================= PRODUCT GRID ================= */}

          {filteredProducts.length > 0 ? (

            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">

              {filteredProducts.map(
                (product) => (

                  <ProductCard
                    key={product.id}
                    product={product}
                  />

                )
              )}

            </div>

          ) : (

            /* ================= NO PRODUCTS ================= */

            <div className="py-20 text-center">

              <div className="text-5xl">
                🔍
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                No products found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Clear Filters
              </button>

            </div>

          )}

        </div>

      </section>

      {/* ================= PROMO BANNER ================= */}

      <PromoBanner />

      {/* ================= NEW ARRIVALS ================= */}

      <NewArrivals />

    </>
  );
}