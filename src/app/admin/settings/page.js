"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const STORE_STORAGE_KEY = "adminStoreSettings";
const ORDER_STORAGE_KEY = "adminOrderSettings";
const PAYMENT_STORAGE_KEY = "adminPaymentSettings";
const SHIPPING_STORAGE_KEY = "adminShippingSettings";

const defaultStoreSettings = {
  storeName: "My Jewellery Store",
  storeEmail: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  currency: "INR",
};

const defaultOrderSettings = {
  minimumOrderAmount: 0,
  allowCancellation: true,
  cancellationWindow: 24,
  autoConfirmOrders: false,
};

const defaultPaymentSettings = {
  codEnabled: true,
  upiEnabled: true,
  cardEnabled: true,
};

const defaultShippingSettings = {
  shippingEnabled: true,
  shippingCharge: 100,
  freeShippingAbove: 2000,
  minimumDeliveryDays: 3,
  maximumDeliveryDays: 7,
};

export default function AdminSettingsPage() {
  const { user, isAuthLoaded } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("store");

  const [storeSettings, setStoreSettings] = useState(
    defaultStoreSettings
  );

  const [orderSettings, setOrderSettings] = useState(
    defaultOrderSettings
  );

  const [paymentSettings, setPaymentSettings] = useState(
    defaultPaymentSettings
  );

  const [shippingSettings, setShippingSettings] = useState(
    defaultShippingSettings
  );

  const [saved, setSaved] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [shippingError, setShippingError] = useState("");

  useEffect(() => {
    if (!isAuthLoaded) return;

    if (!user || user.role !== "admin") {
      router.replace("/admin/login");
      return;
    }

    /* ================= STORE SETTINGS ================= */

    const savedStoreSettings =
      localStorage.getItem(STORE_STORAGE_KEY);

    if (savedStoreSettings) {
      try {
        setStoreSettings({
          ...defaultStoreSettings,
          ...JSON.parse(savedStoreSettings),
        });
      } catch {
        setStoreSettings(defaultStoreSettings);
      }
    }

    /* ================= ORDER SETTINGS ================= */

    const savedOrderSettings =
      localStorage.getItem(ORDER_STORAGE_KEY);

    if (savedOrderSettings) {
      try {
        setOrderSettings({
          ...defaultOrderSettings,
          ...JSON.parse(savedOrderSettings),
        });
      } catch {
        setOrderSettings(defaultOrderSettings);
      }
    }

    /* ================= PAYMENT SETTINGS ================= */

    const savedPaymentSettings =
      localStorage.getItem(PAYMENT_STORAGE_KEY);

    if (savedPaymentSettings) {
      try {
        setPaymentSettings({
          ...defaultPaymentSettings,
          ...JSON.parse(savedPaymentSettings),
        });
      } catch {
        setPaymentSettings(defaultPaymentSettings);
      }
    }

    /* ================= SHIPPING SETTINGS ================= */

    const savedShippingSettings =
      localStorage.getItem(SHIPPING_STORAGE_KEY);

    if (savedShippingSettings) {
      try {
        setShippingSettings({
          ...defaultShippingSettings,
          ...JSON.parse(savedShippingSettings),
        });
      } catch {
        setShippingSettings(defaultShippingSettings);
      }
    }
  }, [isAuthLoaded, user, router]);

  /* =========================================================
     STORE SETTINGS
  ========================================================= */

  const handleStoreChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const phoneValue = value
        .replace(/\D/g, "")
        .slice(0, 10);

      setStoreSettings((prev) => ({
        ...prev,
        phone: phoneValue,
      }));

      setSaved(false);

      if (phoneValue.length === 0) {
        setPhoneError("");
      } else if (!/^[6-9]\d{9}$/.test(phoneValue)) {
        setPhoneError(
          "Enter a valid 10-digit Indian mobile number."
        );
      } else {
        setPhoneError("");
      }

      return;
    }

    setStoreSettings((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
  };

  /* =========================================================
     ORDER SETTINGS
  ========================================================= */

  const handleOrderChange = (e) => {
    const { name, value, type, checked } = e.target;

    setOrderSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSaved(false);
  };

  /* =========================================================
     PAYMENT SETTINGS
  ========================================================= */

  const handlePaymentChange = (e) => {
    const { name, checked } = e.target;

    setPaymentSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));

    setSaved(false);
  };

  /* =========================================================
     SHIPPING SETTINGS
  ========================================================= */

  const handleShippingChange = (e) => {
    const { name, value, type, checked } = e.target;

    setShippingSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setShippingError("");
    setSaved(false);
  };

  /* =========================================================
     SAVE STORE SETTINGS
  ========================================================= */

  const saveStoreSettings = () => {
    if (
      storeSettings.phone &&
      !/^[6-9]\d{9}$/.test(storeSettings.phone)
    ) {
      setPhoneError(
        "Enter a valid 10-digit Indian mobile number."
      );

      return;
    }

    localStorage.setItem(
      STORE_STORAGE_KEY,
      JSON.stringify(storeSettings)
    );

    showSavedMessage();
  };

  /* =========================================================
     SAVE ORDER SETTINGS
  ========================================================= */

  const saveOrderSettings = () => {
    localStorage.setItem(
      ORDER_STORAGE_KEY,
      JSON.stringify({
        ...orderSettings,
        minimumOrderAmount:
          Number(orderSettings.minimumOrderAmount) || 0,
        cancellationWindow:
          Number(orderSettings.cancellationWindow) || 24,
      })
    );

    showSavedMessage();
  };

  /* =========================================================
     SAVE PAYMENT SETTINGS
  ========================================================= */

  const savePaymentSettings = () => {
    const enabledMethods = Object.values(
      paymentSettings
    ).filter(Boolean);

    if (enabledMethods.length === 0) {
      alert("Please enable at least one payment method.");
      return;
    }

    localStorage.setItem(
      PAYMENT_STORAGE_KEY,
      JSON.stringify(paymentSettings)
    );

    showSavedMessage();
  };

  /* =========================================================
     SAVE SHIPPING SETTINGS
  ========================================================= */

  const saveShippingSettings = () => {
    const shippingCharge =
      Number(shippingSettings.shippingCharge);

    const freeShippingAbove =
      Number(shippingSettings.freeShippingAbove);

    const minimumDeliveryDays =
      Number(shippingSettings.minimumDeliveryDays);

    const maximumDeliveryDays =
      Number(shippingSettings.maximumDeliveryDays);

    if (shippingCharge < 0) {
      setShippingError(
        "Shipping charge cannot be negative."
      );
      return;
    }

    if (freeShippingAbove < 0) {
      setShippingError(
        "Free shipping amount cannot be negative."
      );
      return;
    }

    if (minimumDeliveryDays < 1) {
      setShippingError(
        "Minimum delivery days must be at least 1."
      );
      return;
    }

    if (maximumDeliveryDays < 1) {
      setShippingError(
        "Maximum delivery days must be at least 1."
      );
      return;
    }

    if (minimumDeliveryDays > maximumDeliveryDays) {
      setShippingError(
        "Maximum delivery days must be greater than or equal to minimum delivery days."
      );
      return;
    }

    localStorage.setItem(
      SHIPPING_STORAGE_KEY,
      JSON.stringify({
        ...shippingSettings,
        shippingCharge,
        freeShippingAbove,
        minimumDeliveryDays,
        maximumDeliveryDays,
      })
    );

    setShippingError("");
    showSavedMessage();
  };

  /* =========================================================
     SAVED MESSAGE
  ========================================================= */

  const showSavedMessage = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  /* =========================================================
     SAVE FORM
  ========================================================= */

  const handleSave = (e) => {
    e.preventDefault();

    if (activeTab === "store") {
      saveStoreSettings();
    } else if (activeTab === "order") {
      saveOrderSettings();
    } else if (activeTab === "payment") {
      savePaymentSettings();
    } else if (activeTab === "shipping") {
      saveShippingSettings();
    }
  };

  if (!isAuthLoaded || !user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Settings
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your store information and preferences
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <i className="ri-dashboard-line text-lg"></i>
            Dashboard
          </button>

        </div>

        {/* =====================================================
            SETTINGS NAVIGATION
        ===================================================== */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">

          <div className="flex flex-wrap gap-2">

            {/* STORE */}

            <button
              type="button"
              onClick={() => {
                setActiveTab("store");
                setSaved(false);
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === "store"
                  ? "bg-black text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <i className="ri-store-2-line text-lg"></i>
              Store Settings
            </button>

            {/* ORDER */}

            <button
              type="button"
              onClick={() => {
                setActiveTab("order");
                setSaved(false);
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === "order"
                  ? "bg-black text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <i className="ri-shopping-bag-3-line text-lg"></i>
              Order Settings
            </button>

            {/* PAYMENT */}

            <button
              type="button"
              onClick={() => {
                setActiveTab("payment");
                setSaved(false);
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === "payment"
                  ? "bg-black text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <i className="ri-bank-card-line text-lg"></i>
              Payment Settings
            </button>

            {/* SHIPPING */}

            <button
              type="button"
              onClick={() => {
                setActiveTab("shipping");
                setSaved(false);
              }}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                activeTab === "shipping"
                  ? "bg-black text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <i className="ri-truck-line text-lg"></i>
              Shipping Settings
            </button>

          </div>

        </div>

        {/* =====================================================
            STORE SETTINGS
        ===================================================== */}

        {activeTab === "store" && (

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-200 px-6 py-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <i className="ri-store-2-line text-xl text-gray-700"></i>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Store Information
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Basic information about your jewellery store
                  </p>
                </div>

              </div>

            </div>

            <div className="px-6 py-6">

              <form onSubmit={handleSave}>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* STORE NAME */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Store Name
                    </label>

                    <input
                      type="text"
                      name="storeName"
                      value={storeSettings.storeName}
                      onChange={handleStoreChange}
                      placeholder="Enter store name"
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>

                  {/* EMAIL */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Store Email
                    </label>

                    <input
                      type="email"
                      name="storeEmail"
                      value={storeSettings.storeEmail}
                      onChange={handleStoreChange}
                      placeholder="store@example.com"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>

                  {/* PHONE */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={storeSettings.phone}
                      onChange={handleStoreChange}
                      placeholder="Enter 10-digit mobile number"
                      inputMode="numeric"
                      maxLength={10}
                      className={`w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-1 ${
                        phoneError
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-black focus:ring-black"
                      }`}
                    />

                    {phoneError && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                        <i className="ri-error-warning-line"></i>
                        {phoneError}
                      </p>
                    )}

                    {!phoneError &&
                      storeSettings.phone.length === 10 &&
                      /^[6-9]\d{9}$/.test(
                        storeSettings.phone
                      ) && (
                        <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600">
                          <i className="ri-checkbox-circle-line"></i>
                          Valid mobile number
                        </p>
                      )}
                  </div>

                  {/* CURRENCY */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Currency
                    </label>

                    <select
                      name="currency"
                      value={storeSettings.currency}
                      onChange={handleStoreChange}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                    >
                      <option value="INR">
                        INR - Indian Rupee (₹)
                      </option>

                      <option value="USD">
                        USD - US Dollar ($)
                      </option>

                      <option value="EUR">
                        EUR - Euro (€)
                      </option>

                      <option value="GBP">
                        GBP - British Pound (£)
                      </option>
                    </select>
                  </div>

                  {/* ADDRESS */}

                  <div className="md:col-span-2">

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Store Address
                    </label>

                    <textarea
                      name="address"
                      rows={4}
                      value={storeSettings.address}
                      onChange={handleStoreChange}
                      placeholder="Enter store address"
                      className="w-full resize-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                    />

                  </div>

                  {/* CITY */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={storeSettings.city}
                      onChange={handleStoreChange}
                      placeholder="Enter city"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>

                  {/* STATE */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      State
                    </label>

                    <input
                      type="text"
                      name="state"
                      value={storeSettings.state}
                      onChange={handleStoreChange}
                      placeholder="Enter state"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>

                  {/* PINCODE */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Pincode
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      value={storeSettings.pincode}
                      onChange={handleStoreChange}
                      placeholder="Enter pincode"
                      inputMode="numeric"
                      maxLength={6}
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                    />
                  </div>

                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-end">

                  {saved && (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <i className="ri-checkbox-circle-line text-lg"></i>
                      Settings saved successfully
                    </div>
                  )}

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                  >
                    <i className="ri-save-line text-lg"></i>
                    Save Settings
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

        {/* =====================================================
            ORDER SETTINGS
        ===================================================== */}

        {activeTab === "order" && (

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-200 px-6 py-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <i className="ri-shopping-bag-3-line text-xl text-gray-700"></i>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Order Settings
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Configure how customer orders are handled
                  </p>
                </div>

              </div>

            </div>

            <div className="px-6 py-6">

              <form onSubmit={handleSave}>

                <div className="space-y-6">

                  {/* MINIMUM ORDER */}

                  <div className="max-w-xl">

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Minimum Order Amount
                    </label>

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                        ₹
                      </span>

                      <input
                        type="number"
                        name="minimumOrderAmount"
                        value={orderSettings.minimumOrderAmount}
                        onChange={handleOrderChange}
                        min="0"
                        step="1"
                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                      />

                    </div>

                    <p className="mt-1.5 text-xs text-gray-500">
                      Set to ₹0 if there is no minimum order amount.
                    </p>

                  </div>

                  <div className="border-t border-gray-200"></div>

                  {/* CANCELLATION */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Allow Order Cancellation
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Allow customers to cancel eligible orders.
                      </p>
                    </div>

                    <label className="relative inline-flex cursor-pointer items-center">

                      <input
                        type="checkbox"
                        name="allowCancellation"
                        checked={orderSettings.allowCancellation}
                        onChange={handleOrderChange}
                        className="peer sr-only"
                      />

                      <div className="h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-black peer-checked:after:translate-x-full"></div>

                    </label>

                  </div>

                  {/* CANCELLATION WINDOW */}

                  {orderSettings.allowCancellation && (

                    <div className="max-w-xl">

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Cancellation Window
                      </label>

                      <div className="flex gap-3">

                        <input
                          type="number"
                          name="cancellationWindow"
                          value={orderSettings.cancellationWindow}
                          onChange={handleOrderChange}
                          min="1"
                          max="168"
                          step="1"
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black"
                        />

                        <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-600">
                          Hours
                        </div>

                      </div>

                      <p className="mt-1.5 text-xs text-gray-500">
                        Customers can cancel their order within this
                        period.
                      </p>

                    </div>
                  )}

                  <div className="border-t border-gray-200"></div>

                  {/* AUTO CONFIRM */}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Auto Confirm Orders
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        Automatically mark newly placed orders as
                        confirmed.
                      </p>
                    </div>

                    <label className="relative inline-flex cursor-pointer items-center">

                      <input
                        type="checkbox"
                        name="autoConfirmOrders"
                        checked={orderSettings.autoConfirmOrders}
                        onChange={handleOrderChange}
                        className="peer sr-only"
                      />

                      <div className="h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white peer-checked:bg-black peer-checked:after:translate-x-full"></div>

                    </label>

                  </div>

                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-end">

                  {saved && (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <i className="ri-checkbox-circle-line text-lg"></i>
                      Settings saved successfully
                    </div>
                  )}

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                  >
                    <i className="ri-save-line text-lg"></i>
                    Save Settings
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

        {/* =====================================================
            PAYMENT SETTINGS
        ===================================================== */}

        {activeTab === "payment" && (

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="border-b border-gray-200 px-6 py-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <i className="ri-bank-card-line text-xl text-gray-700"></i>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Payment Settings
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Choose which payment methods customers can use
                    during checkout
                  </p>
                </div>

              </div>

            </div>

            <div className="px-6 py-6">

              <form onSubmit={handleSave}>

                <div className="space-y-4">

                  {/* COD */}

                  <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-start gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <i className="ri-hand-coin-line text-xl text-gray-700"></i>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Cash on Delivery
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Allow customers to pay when their order is
                          delivered.
                        </p>
                      </div>

                    </div>

                    <label className="relative inline-flex cursor-pointer items-center">

                      <input
                        type="checkbox"
                        name="codEnabled"
                        checked={paymentSettings.codEnabled}
                        onChange={handlePaymentChange}
                        className="peer sr-only"
                      />

                      <div className="h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-black peer-checked:after:translate-x-full"></div>

                    </label>

                  </div>

                  {/* UPI */}

                  <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-start gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <i className="ri-smartphone-line text-xl text-gray-700"></i>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          UPI
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Allow customers to pay using UPI.
                        </p>
                      </div>

                    </div>

                    <label className="relative inline-flex cursor-pointer items-center">

                      <input
                        type="checkbox"
                        name="upiEnabled"
                        checked={paymentSettings.upiEnabled}
                        onChange={handlePaymentChange}
                        className="peer sr-only"
                      />

                      <div className="h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-black peer-checked:after:translate-x-full"></div>

                    </label>

                  </div>

                  {/* CARD */}

                  <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-start gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <i className="ri-bank-card-line text-xl text-gray-700"></i>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Card Payment
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Allow customers to pay using debit or credit
                          cards.
                        </p>
                      </div>

                    </div>

                    <label className="relative inline-flex cursor-pointer items-center">

                      <input
                        type="checkbox"
                        name="cardEnabled"
                        checked={paymentSettings.cardEnabled}
                        onChange={handlePaymentChange}
                        className="peer sr-only"
                      />

                      <div className="h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-black peer-checked:after:translate-x-full"></div>

                    </label>

                  </div>

                </div>

                <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">

                  <div className="flex items-start gap-3">

                    <i className="ri-information-line mt-0.5 text-lg text-blue-600"></i>

                    <p className="text-sm text-blue-700">
                      These settings currently control the payment
                      options configuration only. The actual online
                      payment gateway integration will be connected
                      during the backend implementation.
                    </p>

                  </div>

                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-end">

                  {saved && (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <i className="ri-checkbox-circle-line text-lg"></i>
                      Payment settings saved successfully
                    </div>
                  )}

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                  >
                    <i className="ri-save-line text-lg"></i>
                    Save Payment Settings
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

        {/* =====================================================
            SHIPPING SETTINGS
        ===================================================== */}

        {activeTab === "shipping" && (

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            {/* HEADER */}

            <div className="border-b border-gray-200 px-6 py-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                  <i className="ri-truck-line text-xl text-gray-700"></i>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Shipping Settings
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Configure shipping charges and delivery options
                  </p>
                </div>

              </div>

            </div>

            {/* FORM */}

            <div className="px-6 py-6">

              <form onSubmit={handleSave}>

                <div className="space-y-6">

                  {/* ================= ENABLE SHIPPING ================= */}

                  <div className="flex flex-col gap-4 rounded-xl border border-gray-200 p-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-start gap-4">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                        <i className="ri-truck-line text-xl text-gray-700"></i>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Enable Shipping
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Allow customers to place orders with
                          delivery.
                        </p>
                      </div>

                    </div>

                    <label className="relative inline-flex cursor-pointer items-center">

                      <input
                        type="checkbox"
                        name="shippingEnabled"
                        checked={shippingSettings.shippingEnabled}
                        onChange={handleShippingChange}
                        className="peer sr-only"
                      />

                      <div className="h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-black peer-checked:after:translate-x-full"></div>

                    </label>

                  </div>

                  {/* ================= SHIPPING CHARGE ================= */}

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Shipping Charge
                      </label>

                      <div className="relative">

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                          ₹
                        </span>

                        <input
                          type="number"
                          name="shippingCharge"
                          value={shippingSettings.shippingCharge}
                          onChange={handleShippingChange}
                          min="0"
                          step="1"
                          disabled={
                            !shippingSettings.shippingEnabled
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                        />

                      </div>

                      <p className="mt-1.5 text-xs text-gray-500">
                        Standard shipping charge for an order.
                      </p>

                    </div>

                    {/* FREE SHIPPING */}

                    <div>

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Free Shipping Above
                      </label>

                      <div className="relative">

                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500">
                          ₹
                        </span>

                        <input
                          type="number"
                          name="freeShippingAbove"
                          value={
                            shippingSettings.freeShippingAbove
                          }
                          onChange={handleShippingChange}
                          min="0"
                          step="1"
                          disabled={
                            !shippingSettings.shippingEnabled
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-900 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                        />

                      </div>

                      <p className="mt-1.5 text-xs text-gray-500">
                        Orders at or above this amount get free
                        shipping.
                      </p>

                    </div>

                  </div>

                  {/* ================= DELIVERY DAYS ================= */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Estimated Delivery Time
                    </label>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      {/* MINIMUM */}

                      <div>

                        <label className="mb-1.5 block text-xs text-gray-500">
                          Minimum Days
                        </label>

                        <div className="flex">

                          <input
                            type="number"
                            name="minimumDeliveryDays"
                            value={
                              shippingSettings.minimumDeliveryDays
                            }
                            onChange={handleShippingChange}
                            min="1"
                            max="60"
                            step="1"
                            disabled={
                              !shippingSettings.shippingEnabled
                            }
                            className="w-full rounded-l-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                          />

                          <span className="flex items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-4 text-sm text-gray-500">
                            Days
                          </span>

                        </div>

                      </div>

                      {/* MAXIMUM */}

                      <div>

                        <label className="mb-1.5 block text-xs text-gray-500">
                          Maximum Days
                        </label>

                        <div className="flex">

                          <input
                            type="number"
                            name="maximumDeliveryDays"
                            value={
                              shippingSettings.maximumDeliveryDays
                            }
                            onChange={handleShippingChange}
                            min="1"
                            max="60"
                            step="1"
                            disabled={
                              !shippingSettings.shippingEnabled
                            }
                            className="w-full rounded-l-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none transition disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                          />

                          <span className="flex items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-4 text-sm text-gray-500">
                            Days
                          </span>

                        </div>

                      </div>

                    </div>

                    <p className="mt-1.5 text-xs text-gray-500">
                      Example: 3–7 days means the customer can expect
                      delivery within 3 to 7 days.
                    </p>

                  </div>

                </div>

                {/* ERROR */}

                {shippingError && (
                  <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">

                    <i className="ri-error-warning-line mt-0.5 text-lg"></i>

                    <span>
                      {shippingError}
                    </span>

                  </div>
                )}

                {/* INFO */}

                <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">

                  <div className="flex items-start gap-3">

                    <i className="ri-information-line mt-0.5 text-lg text-blue-600"></i>

                    <p className="text-sm text-blue-700">
                      Shipping settings are currently stored locally.
                      They will be connected to the checkout and
                      backend when the database and API are
                      implemented.
                    </p>

                  </div>

                </div>

                {/* SAVE */}

                <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-end">

                  {saved && (
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <i className="ri-checkbox-circle-line text-lg"></i>
                      Shipping settings saved successfully
                    </div>
                  )}

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
                  >
                    <i className="ri-save-line text-lg"></i>
                    Save Shipping Settings
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}