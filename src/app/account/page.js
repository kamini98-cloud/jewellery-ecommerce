"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function AccountPage() {
  const router = useRouter();

  const {
    user,
    login,
    updateUser,
    logout,
    isAuthLoaded,
  } = useAuth();

  // ================= NAME STATE =================

  const [name, setName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  // ================= SET INITIAL NAME =================

  useEffect(() => {
    if (user) {
      setName(user.name || "");
    }
  }, [user]);

  // ================= REDIRECT IF NOT LOGGED IN =================

  useEffect(() => {
    if (isAuthLoaded && !user) {
      router.replace("/login");
    }
  }, [isAuthLoaded, user, router]);

  // ================= LOADING =================

  if (!isAuthLoaded || !user) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading...
        </p>
      </main>
    );
  }

  // ================= SAVE NAME =================

  const handleSaveName = () => {
    if (!name.trim()) {
      return;
    }

    login({
      ...user,
      name: name.trim(),
    });

    setIsEditingName(false);
  };

  // ================= LOGOUT =================

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // ================= ADDRESSES =================

  const addresses = user.addresses || [];

  // ================= ORDERS =================

  const orders = Array.isArray(user.orders)
    ? user.orders
    : [];

  // ================= LATEST ORDER =================

  const latestOrder = orders.length > 0
    ? orders[0]
    : null;

  // ================= DELETE ADDRESS =================

  const handleDeleteAddress = (addressId) => {
    const updatedAddresses = addresses.filter(
      (address) => address.id !== addressId
    );

    updateUser({
      addresses: updatedAddresses,
    });
  };

  // ================= EDIT ADDRESS =================

  const handleEditAddress = (addressId) => {
    router.push(`/account/address?id=${addressId}`);
  };

  return (
    <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

      {/* ================= HEADER ================= */}

      <div className="mb-10">

        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          My Account
        </p>

        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          {user.name
            ? `Hello, ${user.name}`
            : "Welcome"}
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          Manage your profile, addresses and orders.
        </p>

      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* ================= PROFILE ================= */}

        <section className="border border-gray-200 p-6">

          <div className="flex items-center justify-between">

            <h2 className="text-lg font-semibold">
              Profile
            </h2>

            {!isEditingName && (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="text-sm underline"
              >
                {user.name ? "Edit" : "Add Name"}
              </button>
            )}

          </div>

          <div className="mt-6 space-y-5">

            {/* NAME */}

            <div>

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Name
              </p>

              {isEditingName ? (

                <div className="mt-2">

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Enter your name"
                    autoFocus
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />

                  <div className="mt-3 flex gap-3">

                    <button
                      type="button"
                      onClick={handleSaveName}
                      className="bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800"
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setName(user.name || "");
                        setIsEditingName(false);
                      }}
                      className="border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                  </div>

                </div>

              ) : (

                <p className="mt-2 text-sm font-medium">
                  {user.name || "Not added yet"}
                </p>

              )}

            </div>

            {/* MOBILE */}

            <div className="border-t pt-5">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Mobile Number
              </p>

              <p className="mt-2 text-sm font-medium">
                +91 {user.mobile}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Verified mobile number
              </p>

            </div>

          </div>

        </section>

        {/* ================= SAVED ADDRESSES ================= */}

        <section className="border border-gray-200 p-6">

          <div className="flex items-center justify-between">

            <h2 className="text-lg font-semibold">
              Saved Addresses
            </h2>

            <button
              type="button"
              onClick={() => router.push("/account/address")}
              className="text-sm underline"
            >
              Add Address
            </button>

          </div>

          {/* ================= NO ADDRESS ================= */}

          {addresses.length === 0 ? (

            <div className="flex min-h-40 items-center justify-center text-center">

              <div>

                <div className="text-3xl">
                  📍
                </div>

                <p className="mt-3 text-sm font-medium">
                  No saved addresses
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Your saved addresses will appear here.
                </p>

              </div>

            </div>

          ) : (

            /* ================= ADDRESS LIST ================= */

            <div className="mt-6 space-y-4">

              {addresses.map((address) => (

                <div
                  key={address.id}
                  className="border border-gray-200 p-4"
                >

                  {/* ADDRESS HEADER */}

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="font-medium">
                        {address.fullName}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        +91 {address.mobile}
                      </p>

                    </div>

                    <span className="border border-gray-300 px-2 py-1 text-xs">
                      {address.addressType}
                    </span>

                  </div>

                  {/* ADDRESS DETAILS */}

                  <div className="mt-4 text-sm leading-6 text-gray-600">

                    <p>
                      {address.address}
                    </p>

                    {address.locality && (
                      <p>
                        {address.locality}
                      </p>
                    )}

                    <p>
                      {address.city}, {address.state} -{" "}
                      {address.pincode}
                    </p>

                  </div>

                  {/* ADDRESS ACTIONS */}

                  <div className="mt-5 flex gap-4 border-t border-gray-200 pt-4">

                    <button
                      type="button"
                      onClick={() =>
                        handleEditAddress(address.id)
                      }
                      className="text-sm underline"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteAddress(address.id)
                      }
                      className="text-sm text-red-600 underline"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* ================= MY ORDERS ================= */}

        <section className="border border-gray-200 p-6">

          <div className="flex items-center justify-between">

            <h2 className="text-lg font-semibold">
              My Orders
            </h2>

            <button
              type="button"
              onClick={() => router.push("/account/orders")}
              className="text-sm underline"
            >
              View Orders
            </button>

          </div>

          {/* ================= ORDERS EXIST ================= */}

          {latestOrder ? (

            <div className="mt-6 border border-gray-200 p-4">

              {/* ORDER TOP */}

              <div className="flex items-start justify-between gap-4">

                <div>

                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Order
                  </p>

                  <p className="mt-1 text-sm font-semibold">
                    {latestOrder.id}
                  </p>

                </div>

                <span className="border border-green-600 px-2 py-1 text-xs text-green-600">
                  {latestOrder.status || "Placed"}
                </span>

              </div>

              {/* ORDER INFORMATION */}

              <div className="mt-5 grid grid-cols-2 gap-4">

                <div>

                  <p className="text-xs text-gray-500">
                    Order Date
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {latestOrder.orderDate
                      ? new Date(
                          latestOrder.orderDate
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-gray-500">
                    Total
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    ₹
                    {Number(
                      latestOrder.total || 0
                    ).toLocaleString("en-IN")}
                  </p>

                </div>

              </div>

              {/* ORDER ITEMS */}

              <div className="mt-5 border-t border-gray-200 pt-4">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-xs text-gray-500">
                      Items
                    </p>

                    <p className="mt-1 text-sm font-medium">
                      {latestOrder.totalItems || 0}{" "}
                      {latestOrder.totalItems === 1
                        ? "item"
                        : "items"}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push("/account/orders")
                    }
                    className="text-sm underline"
                  >
                    View Details
                  </button>

                </div>

              </div>

            </div>

          ) : (

            /* ================= NO ORDERS ================= */

            <div className="flex min-h-40 items-center justify-center text-center">

              <div>

                <div className="text-3xl">
                  📦
                </div>

                <p className="mt-3 text-sm font-medium">
                  No orders yet
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Your order history will appear here.
                </p>

              </div>

            </div>

          )}

        </section>

        {/* ================= ACCOUNT ACTIONS ================= */}

        <section className="border border-gray-200 p-6">

          <h2 className="text-lg font-semibold">
            Account
          </h2>

          <div className="mt-6">

            <button
              type="button"
              onClick={handleLogout}
              className="w-full border border-red-500 px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Logout
            </button>

          </div>

        </section>

      </div>

    </main>
  );
}