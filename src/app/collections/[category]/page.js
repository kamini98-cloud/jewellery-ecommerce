"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import ProductCard from "@/components/ProductCard";
import ProductFilterDropdown from "@/components/product/ProductFilterDropdown";
import SortDropdown from "@/components/product/SortDropdown";

import products from "@/data/products";

export default function CategoryPage() {
  const params = useParams();

  const categorySlug = params.category;

  // Convert URL category to normal category name
  const categoryName =
    categorySlug.charAt(0).toUpperCase() +
    categorySlug.slice(1);

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
    let result = products.filter(
      (product) =>
        product.category.toLowerCase() ===
        categoryName.toLowerCase()
    );

    // CATEGORY FILTER
    if (filters.category.length > 0) {
      result = result.filter((product) =>
        filters.category.includes(product.category)
      );
    }

    // COLOR FILTER
    if (filters.color.length > 0) {
      result = result.filter((product) =>
        filters.color.includes(product.color)
      );
    }

    // MATERIAL FILTER
    if (filters.material.length > 0) {
      result = result.filter((product) =>
        filters.material.includes(product.material)
      );
    }

    // OCCASION FILTER
    if (filters.occasion.length > 0) {
      result = result.filter((product) =>
        filters.occasion.includes(product.occasion)
      );
    }

    // GENDER FILTER
    if (filters.gender.length > 0) {
      result = result.filter((product) =>
        filters.gender.includes(product.gender)
      );
    }

    // MIN PRICE
    if (minPrice !== "") {
      result = result.filter(
        (product) => product.price >= Number(minPrice)
      );
    }

    // MAX PRICE
    if (maxPrice !== "") {
      result = result.filter(
        (product) => product.price <= Number(maxPrice)
      );
    }

    // IN STOCK
    if (inStockOnly) {
      result = result.filter(
        (product) => product.inStock === true
      );
    }

    // DISCOUNT
    if (discount !== "") {
      result = result.filter((product) => {
        if (!product.oldPrice) return false;

        const productDiscount =
          ((product.oldPrice - product.price) /
            product.oldPrice) *
          100;

        return productDiscount >= Number(discount);
      });
    }

    // ================= SORT =================

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
    categoryName,
    filters,
    minPrice,
    maxPrice,
    inStockOnly,
    discount,
    sortBy,
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

      {/* ================= CATEGORY HEADER ================= */}

      <div className="text-center">

        <p className="text-xs uppercase tracking-widest text-gray-500">
          Explore Our Collection
        </p>

        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          {categoryName}
        </h1>

        <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500">
          Discover our beautiful collection of {categoryName.toLowerCase()}.
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
            showCategory={false}
          />

          <SortDropdown
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

        </div>

      </div>

      {/* ================= PRODUCT COUNT ================= */}

      <p className="mt-5 text-sm text-gray-500">
        Showing {filteredProducts.length}{" "}
        {filteredProducts.length === 1
          ? "product"
          : "products"}
      </p>

      {/* ================= PRODUCT GRID ================= */}

      {filteredProducts.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">

          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}

        </div>
      ) : (
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
            onClick={() => {
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
            }}
            className="mt-6 bg-black px-6 py-3 text-sm font-medium text-white"
          >
            Clear Filters
          </button>

        </div>
      )}

    </main>
  );
}