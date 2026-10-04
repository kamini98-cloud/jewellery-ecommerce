"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function AddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { user, updateUser, isAuthLoaded } = useAuth();

  // ================= GET ADDRESS ID =================

  const addressId = searchParams.get("id");

  // ================= ADDRESS STATES =================

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [addressType, setAddressType] = useState("Home");

  // ================= LOAD USER / ADDRESS DATA =================

  useEffect(() => {
    if (!user) return;

    // If editing an existing address
    if (addressId) {
      const existingAddress = (user.addresses || []).find(
        (item) => String(item.id) === String(addressId)
      );

      if (existingAddress) {
        setFullName(existingAddress.fullName || "");
        setMobile(existingAddress.mobile || "");
        setAddress(existingAddress.address || "");
        setLocality(existingAddress.locality || "");
        setCity(existingAddress.city || "");
        setState(existingAddress.state || "");
        setPincode(existingAddress.pincode || "");
        setAddressType(existingAddress.addressType || "Home");
      }

      return;
    }

    // New address
    setFullName(user.name || "");
    setMobile(user.mobile || "");

  }, [user, addressId]);

  // ================= REDIRECT =================

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

  // ================= SAVE / UPDATE ADDRESS =================

  const handleSubmit = (event) => {
    event.preventDefault();

    const existingAddresses = user.addresses || [];

    // ================= EDIT ADDRESS =================

    if (addressId) {
      const updatedAddresses = existingAddresses.map((item) => {
        if (String(item.id) === String(addressId)) {
          return {
            ...item,
            fullName,
            mobile,
            address,
            locality,
            city,
            state,
            pincode,
            addressType,
          };
        }

        return item;
      });

      updateUser({
        addresses: updatedAddresses,
      });

    } else {

      // ================= ADD NEW ADDRESS =================

      const newAddress = {
        id: Date.now(),
        fullName,
        mobile,
        address,
        locality,
        city,
        state,
        pincode,
        addressType,
      };

      updateUser({
        addresses: [
          ...existingAddresses,
          newAddress,
        ],
      });
    }

    // ================= GO BACK TO ACCOUNT =================

    router.push("/account");
  };

  return (
    <main className="mx-auto min-h-[70vh] max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

      {/* ================= BACK BUTTON ================= */}

      <button
        type="button"
        onClick={() => router.push("/account")}
        className="mb-8 text-sm text-gray-500 transition hover:text-black"
      >
        ← Back to Account
      </button>

      {/* ================= HEADER ================= */}

      <div className="mb-10">

        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          My Account
        </p>

        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          {addressId ? "Edit Address" : "Add New Address"}
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          {addressId
            ? "Update your saved address."
            : "Add an address for faster checkout."}
        </p>

      </div>

      {/* ================= ADDRESS FORM ================= */}

      <form
        onSubmit={handleSubmit}
        className="border border-gray-200 p-6 sm:p-8"
      >

        <div className="grid gap-5 sm:grid-cols-2">

          {/* FULL NAME */}

          <div>

            <label
              htmlFor="fullName"
              className="mb-2 block text-sm font-medium"
            >
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              placeholder="Enter full name"
              required
              className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />

          </div>

          {/* MOBILE */}

          <div>

            <label
              htmlFor="mobile"
              className="mb-2 block text-sm font-medium"
            >
              Mobile Number
            </label>

            <div className="flex">

              <div className="flex items-center border border-r-0 border-gray-300 bg-gray-50 px-4 text-sm">
                +91
              </div>

              <input
                id="mobile"
                type="tel"
                inputMode="numeric"
                value={mobile}
                onChange={(event) =>
                  setMobile(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10)
                  )
                }
                placeholder="Mobile number"
                maxLength={10}
                required
                className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
              />

            </div>

          </div>

        </div>

        {/* ADDRESS */}

        <div className="mt-5">

          <label
            htmlFor="address"
            className="mb-2 block text-sm font-medium"
          >
            Address
          </label>

          <textarea
            id="address"
            value={address}
            onChange={(event) =>
              setAddress(event.target.value)
            }
            placeholder="House number, street, area"
            required
            rows={4}
            className="w-full resize-none border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
          />

        </div>

        {/* LOCALITY */}

        <div className="mt-5">

          <label
            htmlFor="locality"
            className="mb-2 block text-sm font-medium"
          >
            Locality / Area
          </label>

          <input
            id="locality"
            type="text"
            value={locality}
            onChange={(event) =>
              setLocality(event.target.value)
            }
            placeholder="Enter locality or area"
            className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
          />

        </div>

        {/* CITY + STATE */}

        <div className="mt-5 grid gap-5 sm:grid-cols-2">

          <div>

            <label
              htmlFor="city"
              className="mb-2 block text-sm font-medium"
            >
              City
            </label>

            <input
              id="city"
              type="text"
              value={city}
              onChange={(event) =>
                setCity(event.target.value)
              }
              placeholder="Enter city"
              required
              className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />

          </div>

          <div>

            <label
              htmlFor="state"
              className="mb-2 block text-sm font-medium"
            >
              State
            </label>

            <input
              id="state"
              type="text"
              value={state}
              onChange={(event) =>
                setState(event.target.value)
              }
              placeholder="Enter state"
              required
              className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
            />

          </div>

        </div>

        {/* PINCODE */}

        <div className="mt-5">

          <label
            htmlFor="pincode"
            className="mb-2 block text-sm font-medium"
          >
            PIN Code
          </label>

          <input
            id="pincode"
            type="text"
            inputMode="numeric"
            value={pincode}
            onChange={(event) =>
              setPincode(
                event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6)
              )
            }
            placeholder="Enter PIN code"
            maxLength={6}
            required
            className="w-full border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-black"
          />

        </div>

        {/* ADDRESS TYPE */}

        <div className="mt-6">

          <p className="mb-3 text-sm font-medium">
            Address Type
          </p>

          <div className="flex flex-wrap gap-3">

            {["Home", "Work", "Other"].map((type) => (

              <button
                key={type}
                type="button"
                onClick={() => setAddressType(type)}
                className={`border px-5 py-2 text-sm transition ${
                  addressType === type
                    ? "border-black bg-black text-white"
                    : "border-gray-300 hover:border-black"
                }`}
              >
                {type}
              </button>

            ))}

          </div>

        </div>

        {/* BUTTONS */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

          <button
            type="submit"
            className="bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            {addressId ? "Update Address" : "Save Address"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/account")}
            className="border border-gray-300 px-6 py-3 text-sm font-medium transition hover:bg-gray-50"
          >
            Cancel
          </button>

        </div>

      </form>

    </main>
  );
}