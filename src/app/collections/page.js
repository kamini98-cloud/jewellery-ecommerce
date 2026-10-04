"use client";

import { useEffect, useMemo, useState } from "react";

import ProductCard from "@/components/ProductCard";
import ProductFilterDropdown from "@/components/product/ProductFilterDropdown";
import SortDropdown from "@/components/product/SortDropdown";

import defaultProducts from "@/data/products";

const PRODUCT_KEY = "adminProducts";

export default function CollectionsPage() {
  // ================= PRODUCTS =================

  const [allProducts, setAllProducts] = useState(
    defaultProducts
  );

  // ================= LOAD ADMIN PRODUCTS =================

  useEffect(() => {
    const loadProducts = () => {
      try {
        const stored =
          localStorage.getItem(PRODUCT_KEY);

        if (stored) {
          const parsed = JSON.parse(stored);

          if (Array.isArray(parsed)) {
            setAllProducts(parsed);
            return;
          }
        }

        setAllProducts(defaultProducts);
      } catch (error) {
        console.error(
          "Failed to load products:",
          error
        );

        setAllProducts(defaultProducts);
      }
    };

    loadProducts();

    // Update when localStorage changes
    const handleStorageChange = (event) => {
      if (event.key === PRODUCT_KEY) {
        loadProducts();
      }
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
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
  const [inStockOnly, setInStockOnly] = useState(false);
  const [discount, setDiscount] = useState("");

  // ================= SORT =================

  const [sortBy, setSortBy] = useState("featured");

  // ================= FILTER + SORT =================

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

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

    // ================= SORT =================

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
          ? ((a.oldPrice -
              a.price) /
              a.oldPrice) *
            100
          : 0;

        const discountB = b.oldPrice
          ? ((b.oldPrice -
              b.price) /
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

  // ================= ACTIVE FILTER CHECK =================

  const hasActiveFilters =
    filters.category.length > 0 ||
    filters.color.length > 0 ||
    filters.material.length > 0 ||
    filters.occasion.length > 0 ||
    filters.gender.length > 0 ||
    minPrice !== "" ||
    maxPrice !== "" ||
    inStockOnly ||
    discount !== "";

  return (
    <main className="mx-auto max-w-[1450px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

      {/* ================= HEADER ================= */}

      <div className="text-center">

        <p className="text-xs uppercase tracking-widest text-gray-500">
          Explore Our Collection
        </p>

        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Our Collections
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500">
          Discover our beautiful jewellery
          collection designed for every
          style and occasion.
        </p>

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
            showCategory={true}
          />

          <SortDropdown
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

        </div>

      </div>

      {/* ================= PRODUCT COUNT ================= */}

      <div className="mt-5 flex items-center justify-between">

        <p className="text-sm text-gray-500">
          Showing{" "}
          {filteredProducts.length}{" "}
          {filteredProducts.length === 1
            ? "product"
            : "products"}
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium underline transition hover:text-gray-500"
          >
            Clear Filters
          </button>
        )}

      </div>

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

        /* ================= EMPTY STATE ================= */

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
            onClick={clearFilters}
            className="mt-6 bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Clear Filters
          </button>

        </div>

      )}

    </main>
  );
}