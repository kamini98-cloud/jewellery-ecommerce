"use client";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";

export default function WishlistPage() {
  const {
    wishlistItems,
    removeFromWishlist,
  } = useWishlist();

  const { addToCart } = useCart();

  // =========================
  // MOVE TO CART
  // =========================

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  return (
    <main className="min-h-screen py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ================= HEADING ================= */}

        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-gray-500">
            Your Favourite Products
          </p>

          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
            Wishlist
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            {wishlistItems.length}{" "}
            {wishlistItems.length === 1
              ? "product"
              : "products"}{" "}
            saved
          </p>
        </div>

        {/* ================= WISHLIST PRODUCTS ================= */}

        {wishlistItems.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">

            {wishlistItems.map((product) => (
              <div key={product.id}>

                <ProductCard
                  product={product}
                />

                {/* ================= MOVE TO CART ================= */}

                <button
                  type="button"
                  onClick={() =>
                    handleMoveToCart(product)
                  }
                  className="mt-3 w-full border border-black px-4 py-3 text-sm font-medium transition hover:bg-black hover:text-white"
                >
                  Move to Cart
                </button>

              </div>
            ))}

          </div>
        ) : (
          <div className="py-20 text-center">

            <div className="text-6xl">
              ♡
            </div>

            <h2 className="mt-6 text-xl font-semibold">
              Your wishlist is empty
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Save your favourite jewellery here and come back to it anytime.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-block bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Continue Shopping
            </Link>

          </div>
        )}

      </div>
    </main>
  );
}