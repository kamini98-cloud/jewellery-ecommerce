"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminCouponsPage() {
  const router = useRouter();

  const {
    user,
    isAdmin,
    isAuthLoaded,
  } = useAuth();

  const [coupons, setCoupons] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minimumOrder: "",
    expiryDate: "",
    usageLimit: "",
    isActive: true,
  });

  // ============================
  // ADMIN ACCESS
  // ============================

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    if (!user || !isAdmin) {
      router.replace("/admin/login");
    }
  }, [
    isAuthLoaded,
    user,
    isAdmin,
    router,
  ]);

  // ============================
  // LOAD COUPONS
  // ============================

  useEffect(() => {
    if (!isAuthLoaded || !isAdmin) {
      return;
    }

    try {
      const storedCoupons =
        localStorage.getItem("adminCoupons");

      if (storedCoupons) {
        const parsedCoupons =
          JSON.parse(storedCoupons);

        if (Array.isArray(parsedCoupons)) {
          setCoupons(parsedCoupons);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load coupons:",
        error
      );
    }
  }, [
    isAuthLoaded,
    isAdmin,
  ]);

  // ============================
  // SAVE COUPONS
  // ============================

  const saveCoupons = (updatedCoupons) => {
    setCoupons(updatedCoupons);

    localStorage.setItem(
      "adminCoupons",
      JSON.stringify(updatedCoupons)
    );
  };

  // ============================
  // FORM CHANGE
  // ============================

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  // ============================
  // RESET FORM
  // ============================

  const resetForm = () => {
    setForm({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minimumOrder: "",
      expiryDate: "",
      usageLimit: "",
      isActive: true,
    });

    setEditingCoupon(null);
    setShowForm(false);
  };

  // ============================
  // OPEN ADD FORM
  // ============================

  const handleAddCoupon = () => {
    setEditingCoupon(null);

    setForm({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minimumOrder: "",
      expiryDate: "",
      usageLimit: "",
      isActive: true,
    });

    setShowForm(true);
  };

  // ============================
  // EDIT COUPON
  // ============================

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);

    setForm({
      code: coupon.code || "",
      description:
        coupon.description || "",
      discountType:
        coupon.discountType ||
        "percentage",
      discountValue:
        coupon.discountValue ?? "",
      minimumOrder:
        coupon.minimumOrder ?? "",
      expiryDate:
        coupon.expiryDate || "",
      usageLimit:
        coupon.usageLimit ?? "",
      isActive:
        coupon.isActive !== false,
    });

    setShowForm(true);
  };

  // ============================
  // VALIDATE FORM
  // ============================

  const validateForm = () => {
    const code =
      form.code.trim().toUpperCase();

    if (!code) {
      alert("Please enter a coupon code.");
      return false;
    }

    if (!form.discountValue) {
      alert(
        "Please enter a discount value."
      );
      return false;
    }

    const discountValue =
      Number(form.discountValue);

    if (
      Number.isNaN(discountValue) ||
      discountValue <= 0
    ) {
      alert(
        "Discount value must be greater than 0."
      );
      return false;
    }

    if (
      form.discountType ===
        "percentage" &&
      discountValue > 100
    ) {
      alert(
        "Percentage discount cannot be more than 100%."
      );
      return false;
    }

    if (
      form.minimumOrder !== "" &&
      Number(form.minimumOrder) < 0
    ) {
      alert(
        "Minimum order cannot be negative."
      );
      return false;
    }

    if (
      form.usageLimit !== "" &&
      Number(form.usageLimit) < 1
    ) {
      alert(
        "Usage limit must be at least 1."
      );
      return false;
    }

    // Check duplicate code
    const duplicateCoupon =
      coupons.find(
        (coupon) =>
          coupon.code?.toUpperCase() ===
            code &&
          coupon.id !== editingCoupon?.id
      );

    if (duplicateCoupon) {
      alert(
        "A coupon with this code already exists."
      );
      return false;
    }

    return true;
  };

  // ============================
  // SAVE / UPDATE COUPON
  // ============================

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const couponData = {
      id:
        editingCoupon?.id ||
        `coupon-${Date.now()}`,

      code:
        form.code
          .trim()
          .toUpperCase(),

      description:
        form.description.trim(),

      discountType:
        form.discountType,

      discountValue:
        Number(form.discountValue),

      minimumOrder:
        form.minimumOrder === ""
          ? 0
          : Number(form.minimumOrder),

      expiryDate:
        form.expiryDate || "",

      usageLimit:
        form.usageLimit === ""
          ? null
          : Number(form.usageLimit),

      isActive:
        form.isActive,

      createdAt:
        editingCoupon?.createdAt ||
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString(),
    };

    let updatedCoupons;

    if (editingCoupon) {
      updatedCoupons =
        coupons.map((coupon) =>
          coupon.id ===
          editingCoupon.id
            ? couponData
            : coupon
        );
    } else {
      updatedCoupons = [
        couponData,
        ...coupons,
      ];
    }

    saveCoupons(updatedCoupons);

    alert(
      editingCoupon
        ? "Coupon updated successfully."
        : "Coupon created successfully."
    );

    resetForm();
  };

  // ============================
  // DELETE COUPON
  // ============================

  const handleDeleteCoupon = (coupon) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete coupon "${coupon.code}"?`
    );

    if (!confirmed) {
      return;
    }

    const updatedCoupons =
      coupons.filter(
        (item) =>
          item.id !== coupon.id
      );

    saveCoupons(updatedCoupons);
  };

  // ============================
  // TOGGLE STATUS
  // ============================

  const handleToggleStatus = (coupon) => {
    const updatedCoupons =
      coupons.map((item) =>
        item.id === coupon.id
          ? {
              ...item,
              isActive:
                !item.isActive,
              updatedAt:
                new Date().toISOString(),
            }
          : item
      );

    saveCoupons(updatedCoupons);
  };

  // ============================
  // FORMAT DISCOUNT
  // ============================

  const formatDiscount = (coupon) => {
    if (
      coupon.discountType ===
      "fixed"
    ) {
      return `₹${Number(
        coupon.discountValue || 0
      ).toLocaleString("en-IN")}`;
    }

    return `${coupon.discountValue || 0}%`;
  };

  // ============================
  // FORMAT EXPIRY
  // ============================

  const formatExpiry = (date) => {
    if (!date) {
      return "No expiry";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Invalid date";
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ============================
  // LOADING
  // ============================

  if (!isAuthLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Loading coupons...
        </p>
      </main>
    );
  }

  // ============================
  // UNAUTHORIZED
  // ============================

  if (!user || !isAdmin) {
    return null;
  }

  // ============================
  // PAGE
  // ============================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ================= HEADER ================= */}

      <div className="border-b bg-white">

        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Admin Panel
              </p>

              <h1 className="mt-1 text-2xl font-semibold">
                Coupons
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Create and manage store discount coupons.
              </p>

            </div>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() =>
                  router.push("/admin")
                }
                className="border border-black px-5 py-3 text-sm font-medium transition hover:bg-black hover:text-white"
              >
                Back to Dashboard
              </button>

              <button
                type="button"
                onClick={handleAddCoupon}
                className="bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                + Add Coupon
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* ================= CONTENT ================= */}

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

        {/* ================= COUPON FORM ================= */}

        {showForm && (

          <div className="mb-8 border border-gray-200 bg-white p-6">

            <div className="mb-6 flex items-center justify-between">

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  {editingCoupon
                    ? "Edit Coupon"
                    : "New Coupon"}
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {editingCoupon
                    ? "Update Coupon"
                    : "Create Coupon"}
                </h2>

              </div>

              <button
                type="button"
                onClick={resetForm}
                className="text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-5 sm:grid-cols-2"
            >

              {/* CODE */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Coupon Code
                </label>

                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  placeholder="e.g. WELCOME10"
                  maxLength={30}
                  className="w-full border px-4 py-3 text-sm uppercase outline-none focus:border-black"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <input
                  type="text"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="10% off on your first order"
                  className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                />

              </div>

              {/* DISCOUNT TYPE */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Discount Type
                </label>

                <select
                  name="discountType"
                  value={form.discountType}
                  onChange={handleChange}
                  className="w-full border bg-white px-4 py-3 text-sm outline-none focus:border-black"
                >

                  <option value="percentage">
                    Percentage (%)
                  </option>

                  <option value="fixed">
                    Fixed Amount (₹)
                  </option>

                </select>

              </div>

              {/* DISCOUNT VALUE */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Discount Value
                </label>

                <input
                  type="number"
                  name="discountValue"
                  value={form.discountValue}
                  onChange={handleChange}
                  min="1"
                  max={
                    form.discountType ===
                    "percentage"
                      ? "100"
                      : undefined
                  }
                  placeholder={
                    form.discountType ===
                    "percentage"
                      ? "10"
                      : "500"
                  }
                  className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                />

              </div>

              {/* MINIMUM ORDER */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Minimum Order Value
                </label>

                <input
                  type="number"
                  name="minimumOrder"
                  value={form.minimumOrder}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 3000"
                  className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Leave 0 if there is no minimum order.
                </p>

              </div>

              {/* EXPIRY */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Expiry Date
                </label>

                <input
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate}
                  onChange={handleChange}
                  className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Leave empty for no expiry.
                </p>

              </div>

              {/* USAGE LIMIT */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Usage Limit
                </label>

                <input
                  type="number"
                  name="usageLimit"
                  value={form.usageLimit}
                  onChange={handleChange}
                  min="1"
                  placeholder="e.g. 100"
                  className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Leave empty for unlimited usage.
                </p>

              </div>

              {/* STATUS */}

              <div className="flex items-center">

                <label className="flex cursor-pointer items-center gap-3">

                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />

                  <span className="text-sm font-medium">
                    Coupon is active
                  </span>

                </label>

              </div>

              {/* BUTTONS */}

              <div className="flex flex-col gap-3 border-t pt-5 sm:col-span-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-gray-300 px-6 py-3 text-sm font-medium transition hover:border-black"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  {editingCoupon
                    ? "Update Coupon"
                    : "Create Coupon"}
                </button>

              </div>

            </form>

          </div>

        )}

        {/* ================= COUPONS ================= */}

        <div className="border border-gray-200 bg-white">

          <div className="border-b px-5 py-5">

            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Discount Management
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Coupon List
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              {coupons.length}{" "}
              {coupons.length === 1
                ? "coupon"
                : "coupons"}{" "}
              configured
            </p>

          </div>

          {coupons.length === 0 ? (

            <div className="px-6 py-16 text-center">

              <div className="text-4xl">
                🎟️
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No coupons yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Create your first discount coupon to offer promotions to customers.
              </p>

              <button
                type="button"
                onClick={handleAddCoupon}
                className="mt-6 bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                + Create Coupon
              </button>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[950px]">

                <thead className="bg-gray-50">

                  <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-500">

                    <th className="px-5 py-4 font-medium">
                      Coupon
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Discount
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Minimum Order
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Expiry
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Usage Limit
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {coupons.map(
                    (coupon) => (

                      <tr
                        key={coupon.id}
                        className="border-b last:border-b-0 hover:bg-gray-50"
                      >

                        {/* COUPON */}

                        <td className="px-5 py-5">

                          <p className="font-semibold">
                            {coupon.code}
                          </p>

                          <p className="mt-1 max-w-xs text-xs text-gray-500">
                            {coupon.description ||
                              "No description"}
                          </p>

                        </td>

                        {/* DISCOUNT */}

                        <td className="px-5 py-5">

                          <span className="font-semibold">
                            {formatDiscount(
                              coupon
                            )}
                          </span>

                        </td>

                        {/* MINIMUM */}

                        <td className="px-5 py-5 text-sm">

                          ₹
                          {Number(
                            coupon.minimumOrder ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>

                        {/* EXPIRY */}

                        <td className="px-5 py-5 text-sm">

                          {formatExpiry(
                            coupon.expiryDate
                          )}

                        </td>

                        {/* USAGE */}

                        <td className="px-5 py-5 text-sm">

                          {coupon.usageLimit ??
                            "Unlimited"}

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-5">

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(
                                coupon
                              )
                            }
                            className={`border px-3 py-1 text-xs font-medium ${
                              coupon.isActive
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-gray-200 bg-gray-50 text-gray-600"
                            }`}
                          >
                            {coupon.isActive
                              ? "Active"
                              : "Inactive"}
                          </button>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-5">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleEditCoupon(
                                  coupon
                                )
                              }
                              className="border border-black px-4 py-2 text-xs font-medium transition hover:bg-black hover:text-white"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteCoupon(
                                  coupon
                                )
                              }
                              className="border border-red-600 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}