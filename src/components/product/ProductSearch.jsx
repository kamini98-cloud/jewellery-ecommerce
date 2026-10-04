"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import products from "@/data/products";

export default function ProductSearch({ isOpen, onClose }) {
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    if (!search.trim()) {
      return [];
    }

    const searchText = search.toLowerCase();

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchText) ||
        product.category.toLowerCase().includes(searchText) ||
        product.color?.toLowerCase().includes(searchText) ||
        product.material?.toLowerCase().includes(searchText)
    );
  }, [search]);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/40">
      <div className="absolute left-0 right-0 top-0 bg-white shadow-lg">

        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">

          {/* Header */}
          <div className="flex items-center justify-between gap-4">

            <h2 className="text-lg font-semibold">
              Search Products
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center text-xl"
              aria-label="Close search"
            >
              ✕
            </button>

          </div>

          {/* Search Input */}
          <div className="relative mt-5">

            <input
              type="search"
              autoFocus
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search for jewellery..."
              className="w-full border border-gray-300 px-5 py-4 pr-12 text-sm outline-none focus:border-black"
            />

            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              🔍
            </span>

          </div>

          {/* Search Results */}
          {search.trim() && (
            <div className="mt-6 max-h-[60vh] overflow-y-auto">

              {filteredProducts.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">

                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      onClick={onClose}
                      className="flex gap-4 border border-gray-200 p-3 transition hover:border-black"
                    >
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-gray-100">

                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />

                      </div>

                      <div className="flex flex-col justify-center">

                        <h3 className="text-sm font-medium">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-sm font-semibold">
                          ₹{product.price.toLocaleString("en-IN")}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {product.category}
                        </p>

                      </div>

                    </Link>
                  ))}

                </div>
              ) : (
                <div className="py-10 text-center">

                  <p className="text-sm text-gray-500">
                    No products found for "{search}"
                  </p>

                </div>
              )}

            </div>
          )}

          {/* Initial State */}
          {!search.trim() && (
            <div className="py-10 text-center text-sm text-gray-500">
              Start typing to search products.
            </div>
          )}

        </div>

      </div>
    </div>
  );
}