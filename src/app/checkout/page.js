"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { cartItems, cartTotal, totalItems } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    // Remove error once user starts correcting the field
    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log("Checkout information:", formData);

    // Payment integration will be added later.
    alert("Customer information saved. Payment will be added next.");
  };

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl text-center">

          <div className="text-6xl">🛒</div>

          <h1 className="mt-6 text-3xl font-semibold">
            Your Cart is Empty
          </h1>

          <p className="mt-3 text-gray-500">
            Add some products before proceeding to checkout.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block bg-black px-8 py-4 text-sm font-medium text-white"
          >
            Continue Shopping
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

      {/* Heading */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          Secure Checkout
        </p>

        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          Checkout
        </h1>
      </div>

      <form onSubmit={handleSubmit}>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">

          {/* ================= CUSTOMER DETAILS ================= */}
          <div className="space-y-10">

            {/* Contact Information */}
            <section>

              <h2 className="text-xl font-semibold">
                Contact Information
              </h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">

                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                  />

                  {errors.fullName && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email Address
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                  />

                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                  />

                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.phone}
                    </p>
                  )}
                </div>

              </div>

            </section>

            {/* Shipping Address */}
            <section>

              <h2 className="text-xl font-semibold">
                Delivery Address
              </h2>

              <div className="mt-6 space-y-5">

                {/* Address */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Address
                  </label>

                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    placeholder="House / Flat / Street / Locality"
                    className="w-full resize-none border px-4 py-3 text-sm outline-none focus:border-black"
                  />

                  {errors.address && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Apartment */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Apartment, Suite, etc.
                    <span className="ml-1 font-normal text-gray-400">
                      (Optional)
                    </span>
                  </label>

                  <input
                    type="text"
                    name="apartment"
                    value={formData.apartment}
                    onChange={handleChange}
                    placeholder="Apartment / Floor / Landmark"
                    className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                  />
                </div>

                {/* City / State */}
                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                    />

                    {errors.city && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      State
                    </label>

                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                    />

                    {errors.state && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.state}
                      </p>
                    )}
                  </div>

                </div>

                {/* Pincode */}
                <div className="sm:w-1/2">

                  <label className="mb-2 block text-sm font-medium">
                    Pincode
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                  />

                  {errors.pincode && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.pincode}
                    </p>
                  )}

                </div>

              </div>

            </section>

          </div>

          {/* ================= ORDER SUMMARY ================= */}
          <aside className="h-fit border p-6 sm:p-8">

            <h2 className="text-lg font-semibold">
              Your Order
            </h2>

            {/* Products */}
            <div className="mt-6 space-y-5">

              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 text-sm"
                >

                  <div>
                    <p className="font-medium">
                      {item.name}
                    </p>

                    <p className="mt-1 text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="font-medium">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>

                </div>
              ))}

            </div>

            <div className="my-6 border-t" />

            <div className="space-y-4 text-sm">

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

                <span className="text-green-600">
                  FREE
                </span>
              </div>

            </div>

            <div className="my-6 border-t" />

            <div className="flex justify-between">

              <span className="font-semibold">
                Total
              </span>

              <span className="text-xl font-semibold">
                ₹{cartTotal.toLocaleString("en-IN")}
              </span>

            </div>

            {/* Submit */}
            <button
              type="submit"
              className="mt-6 w-full bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Continue to Payment
            </button>

            <p className="mt-4 text-center text-xs text-gray-500">
              Your information is securely handled.
            </p>

          </aside>

        </div>

      </form>

    </main>
  );
}