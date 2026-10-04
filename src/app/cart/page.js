"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState } from "react";
import CheckoutModal from "@/components/checkout/CheckoutModal";

export default function CartPage() {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    cartTotal,
    totalItems,
  } = useCart();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  // Empty cart
  if (cartItems.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-xl text-center">

          <div className="text-6xl">
            🛒
          </div>

          <h1 className="mt-6 text-3xl font-semibold">
            Your Cart is Empty
          </h1>

          <p className="mt-3 text-gray-500">
            Looks like you haven't added anything to your cart yet.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block bg-black px-8 py-4 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Continue Shopping
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

      {/* Page Heading */}
      <div className="mb-10">

        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          Shopping Bag
        </p>

        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          My Cart
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
        </p>

      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">

        {/* ================= CART ITEMS ================= */}
        <div className="space-y-6">

          {cartItems.map((item) => {

            const itemTotal = item.price * item.quantity;

            return (
              <div
                key={item.id}
                className="border-b pb-6"
              >

                <div className="flex gap-4 sm:gap-6">

                  {/* Product Image */}
                  <Link
                    href={`/products/${item.id}`}
                    className="relative h-28 w-24 flex-shrink-0 overflow-hidden bg-gray-100 sm:h-36 sm:w-32"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 96px, 128px"
                      className="object-cover"
                    />
                  </Link>

                  {/* Product Information */}
                  <div className="flex min-w-0 flex-1 flex-col">

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <Link
                          href={`/products/${item.id}`}
                          className="font-medium hover:underline"
                        >
                          {item.name}
                        </Link>

                        <p className="mt-1 text-sm text-gray-500">
                          ₹{item.price.toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-gray-500 underline hover:text-black"
                      >
                        Remove
                      </button>

                    </div>

                    {/* Quantity + Total */}
                    <div className="mt-auto flex items-end justify-between gap-4">

                      {/* Quantity */}
                      <div>

                        <p className="mb-2 text-xs text-gray-500">
                          Quantity
                        </p>

                        <div className="flex w-fit items-center border">

                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item.id)}
                            className="px-3 py-1.5 text-lg"
                          >
                            −
                          </button>

                          <span className="min-w-10 text-center text-sm">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => increaseQuantity(item.id)}
                            className="px-3 py-1.5 text-lg"
                          >
                            +
                          </button>

                        </div>

                      </div>

                      {/* Item Total */}
                      <p className="font-semibold">
                        ₹{itemTotal.toLocaleString("en-IN")}
                      </p>

                    </div>

                  </div>

                </div>

              </div>
            );
          })}

          {/* Continue Shopping */}
          <div className="pt-2">

            <Link
              href="/"
              className="text-sm font-medium underline"
            >
              ← Continue Shopping
            </Link>

          </div>

        </div>

        {/* ================= ORDER SUMMARY ================= */}
        <aside className="h-fit border p-6 sm:p-8">

          <h2 className="text-lg font-semibold">
            Order Summary
          </h2>

          <div className="mt-6 space-y-4 text-sm">

            <div className="flex justify-between">
              <span className="text-gray-500">
                Items
              </span>

              <span>
                {totalItems}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Subtotal
              </span>

              <span>
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">
                Shipping
              </span>

              <span>
                Calculated at checkout
              </span>
            </div>

          </div>

          <div className="my-6 border-t" />

          <div className="flex items-center justify-between">

            <span className="font-semibold">
              Total
            </span>

            <span className="text-xl font-semibold">
              ₹{cartTotal.toLocaleString("en-IN")}
            </span>

          </div>

          {/* Checkout */}
       <button
  type="button"
  onClick={() => setCheckoutOpen(true)}
  className="mt-6 w-full bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-gray-800"
>
  Proceed to Checkout
</button>

          {/* Payment Info */}
          <p className="mt-4 text-center text-xs text-gray-500">
            Secure checkout • Multiple payment options
          </p>

        </aside>

      </div>

<CheckoutModal
  isOpen={checkoutOpen}
  onClose={() => setCheckoutOpen(false)}
/>



    </main>
  );
}