"use client";

import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();

  return (
    <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

      {/* BACK BUTTON */}

      <button
        type="button"
        onClick={() => router.back()}
        className="mb-8 text-sm text-gray-500 transition hover:text-black"
      >
        ← Back to Checkout
      </button>

      {/* HEADER */}

      <div className="mb-10">

        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          Checkout
        </p>

        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Payment
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Choose your preferred payment method.
        </p>

      </div>

      {/* PAYMENT METHODS */}

      <div className="grid gap-6 md:grid-cols-2">

        {/* UPI */}

        <button
          type="button"
          className="border border-gray-200 p-6 text-left transition hover:border-black"
        >
          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold">
                UPI
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Pay using Google Pay, PhonePe, Paytm or any UPI app.
              </p>
            </div>

            <span className="text-2xl">
              📱
            </span>

          </div>
        </button>

        {/* CARD */}

        <button
          type="button"
          className="border border-gray-200 p-6 text-left transition hover:border-black"
        >
          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold">
                Credit / Debit Card
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Pay securely using your card.
              </p>
            </div>

            <span className="text-2xl">
              💳
            </span>

          </div>
        </button>

        {/* CASH ON DELIVERY */}

        <button
          type="button"
          className="border border-gray-200 p-6 text-left transition hover:border-black"
        >
          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-semibold">
                Cash on Delivery
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Pay when your order is delivered.
              </p>
            </div>

            <span className="text-2xl">
              💵
            </span>

          </div>
        </button>

      </div>

    </main>
  );
}