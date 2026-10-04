"use client";

import { useWishlist } from "@/context/WishlistContext";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const router = useRouter();

  const isWishlisted = isInWishlist(product.id);

  const discountPercentage = product.oldPrice
    ? Math.round(
        ((Number(product.oldPrice) -
          Number(product.price)) /
          Number(product.oldPrice)) *
          100
      )
    : 0;

  // ================= IMAGE HELPERS =================

  const isValidImageUrl = (src) => {
    if (typeof src !== "string" || !src.trim()) {
      return false;
    }

    const value = src.trim();

    // Base64 image
    if (value.startsWith("data:image/")) {
      return true;
    }

    // Local public image
    if (value.startsWith("/")) {
      return true;
    }

    // External image
    if (
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {
      return true;
    }

    return false;
  };

  const mainImage = isValidImageUrl(product.image)
    ? product.image
    : "/products/placeholder.webp";

  const hoverImage = isValidImageUrl(product.hoverImage)
    ? product.hoverImage
    : mainImage;

  const activeImage = isHovered
    ? hoverImage
    : mainImage;

  const isBase64Image =
    typeof activeImage === "string" &&
    activeImage.startsWith("data:image/");

  const isExternalImage =
    typeof activeImage === "string" &&
    (activeImage.startsWith("http://") ||
      activeImage.startsWith("https://"));

  // ================= ADD TO CART =================

  const handleAddToCart = () => {
    addToCart(product, 1);
    router.push(`/products/${product.id}`);
  };

  return (
    <div className="group">

      {/* ================= PRODUCT IMAGE ================= */}

      <div
        className="relative aspect-[4/5] overflow-hidden bg-gray-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >

        <Link
          href={`/products/${product.id}`}
          className="absolute inset-0 z-0"
          aria-label={`View ${product.name}`}
        >

          {/* ================= BASE64 / INVALID-NEXT IMAGE ================= */}

          {isBase64Image ? (
            <img
              src={activeImage}
              alt={product.name || "Product"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : isExternalImage ? (
            <img
              src={activeImage}
              alt={product.name || "Product"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            /* ================= LOCAL NEXT IMAGE ================= */

            <Image
              src={activeImage}
              alt={product.name || "Product"}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}

        </Link>

        {/* ================= OFFER ================= */}

        {product.offer && (
          <div className="absolute left-3 top-3 z-10 bg-black px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
            {product.offer}
          </div>
        )}

        {/* ================= WISHLIST ================= */}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            toggleWishlist(product);
          }}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl shadow-sm transition hover:scale-110 ${
            isWishlisted
              ? "text-red-500"
              : "text-black"
          }`}
          aria-label={
            isWishlisted
              ? "Remove from wishlist"
              : "Add to wishlist"
          }
        >
          {isWishlisted ? "♥" : "♡"}
        </button>

        {/* ================= ADD TO CART ================= */}

        <button
          type="button"
          onClick={handleAddToCart}
          className="absolute bottom-3 left-3 right-3 z-10 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wide text-black opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-black hover:text-white"
        >
          Add to Cart
        </button>

      </div>

      {/* ================= PRODUCT INFO ================= */}

      <div className="pt-4">

        <Link href={`/products/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-medium leading-5 hover:underline">
            {product.name}
          </h3>
        </Link>

        {/* ================= RATING ================= */}

        {product.rating && (
          <div className="mt-2 flex items-center gap-1 text-xs">

            <span>★</span>

            <span className="font-medium">
              {product.rating}
            </span>

            {product.reviews && (
              <span className="text-gray-400">
                ({product.reviews})
              </span>
            )}

          </div>
        )}

        {/* ================= PRICE ================= */}

        <div className="mt-2 flex flex-wrap items-center gap-2">

          <span className="text-sm font-semibold">
            ₹
            {Number(
              product.price || 0
            ).toLocaleString("en-IN")}
          </span>

          {product.oldPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹
              {Number(
                product.oldPrice
              ).toLocaleString("en-IN")}
            </span>
          )}

          {discountPercentage > 0 && (
            <span className="text-xs font-medium text-green-600">
              {discountPercentage}% OFF
            </span>
          )}

        </div>

      </div>

    </div>
  );
}