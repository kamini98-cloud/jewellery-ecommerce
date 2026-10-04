"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const BANNER_KEY = "adminBanners";

export default function AdminBannersPage() {
  const router = useRouter();
  const { user, isAuthLoaded } = useAuth();

  // ================= STATES =================

  const [banners, setBanners] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [typeFilter, setTypeFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);

  const [editingBanner, setEditingBanner] = useState(null);

  const [formData, setFormData] = useState({
    type: "hero",
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
    image: "",
    isActive: true,
    displayOrder: "",
  });

  const [error, setError] = useState("");

  // ================= ADMIN PROTECTION =================

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    if (!user || user.role !== "admin") {
      router.replace("/admin/login");
    }
  }, [isAuthLoaded, user, router]);

  // ================= LOAD BANNERS =================

  useEffect(() => {
    if (!isAuthLoaded || !user) {
      return;
    }

    try {
      const stored = localStorage.getItem(BANNER_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setBanners(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load banners:", error);
    }
  }, [isAuthLoaded, user]);

  // ================= SAVE BANNERS =================

  const saveBanners = (updatedBanners) => {
    setBanners(updatedBanners);

    localStorage.setItem(
      BANNER_KEY,
      JSON.stringify(updatedBanners)
    );
  };

  // ================= ADD BANNER =================

  const handleAddBanner = () => {
    setEditingBanner(null);

    setFormData({
      type: "hero",
      title: "",
      subtitle: "",
      buttonText: "",
      buttonLink: "",
      image: "",
      isActive: true,
      displayOrder: "",
    });

    setError("");
    setShowModal(true);
  };

  // ================= EDIT BANNER =================

  const handleEditBanner = (banner) => {
    setEditingBanner(banner);

    setFormData({
      // Old banners without type are treated as Hero
      type: banner.type || "hero",

      title: banner.title || "",

      subtitle: banner.subtitle || "",

      buttonText: banner.buttonText || "",

      buttonLink: banner.buttonLink || "",

      image: banner.image || "",

      isActive: banner.isActive !== false,

      displayOrder: banner.displayOrder || "",
    });

    setError("");
    setShowModal(true);
  };

  // ================= IMAGE UPLOAD =================

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please upload JPG, JPEG, PNG or WEBP image."
      );
      return;
    }

    // Maximum 5MB
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setFormData((current) => ({
        ...current,
        image: reader.result,
      }));

      setError("");
    };

    reader.readAsDataURL(file);
  };

  // ================= SAVE BANNER =================

  const handleSaveBanner = () => {
    const type = formData.type;

    const title = formData.title.trim();

    const subtitle = formData.subtitle.trim();

    const buttonText = formData.buttonText.trim();

    const buttonLink = formData.buttonLink.trim();

    // ================= TYPE REQUIRED =================

    if (!type) {
      setError("Please select banner type.");
      return;
    }

    // ================= IMAGE REQUIRED =================

    if (!formData.image) {
      setError("Please upload banner image.");
      return;
    }

    // ================= DISPLAY ORDER OPTIONAL =================

    const enteredOrder = Number(formData.displayOrder);

    const displayOrder =
      Number.isInteger(enteredOrder) &&
      enteredOrder > 0
        ? enteredOrder
        : banners.length + 1;

    // ================= EDIT =================

    if (editingBanner) {
      const updatedBanners = banners.map((banner) =>
        banner.id === editingBanner.id
          ? {
              ...banner,

              type,

              title,

              subtitle,

              buttonText,

              buttonLink,

              image: formData.image,

              isActive: formData.isActive,

              displayOrder,

              updatedAt: new Date().toISOString(),
            }
          : banner
      );

      saveBanners(updatedBanners);
    }

    // ================= ADD =================

    else {
      const newBanner = {
        id:
          typeof crypto !== "undefined" &&
          crypto.randomUUID
            ? `BAN-${crypto.randomUUID()}`
            : `BAN-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`,

        type,

        title,

        subtitle,

        buttonText,

        buttonLink,

        image: formData.image,

        isActive: formData.isActive,

        displayOrder,

        createdAt: new Date().toISOString(),

        updatedAt: new Date().toISOString(),
      };

      saveBanners([
        ...banners,
        newBanner,
      ]);
    }

    setShowModal(false);

    setEditingBanner(null);

    setError("");
  };

  // ================= DELETE BANNER =================

  const handleDeleteBanner = (banner) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this banner?"
    );

    if (!confirmed) {
      return;
    }

    const updatedBanners = banners.filter(
      (item) => item.id !== banner.id
    );

    saveBanners(updatedBanners);
  };

  // ================= TOGGLE STATUS =================

  const handleToggleStatus = (banner) => {
    const updatedBanners = banners.map((item) =>
      item.id === banner.id
        ? {
            ...item,

            isActive: !item.isActive,

            updatedAt: new Date().toISOString(),
          }
        : item
    );

    saveBanners(updatedBanners);
  };

  // ================= FILTER =================

  const filteredBanners = banners
    .filter((banner) => {
      const searchValue = search.trim().toLowerCase();

      if (!searchValue) {
        return true;
      }

      return (
        banner.title
          ?.toLowerCase()
          .includes(searchValue) ||
        banner.subtitle
          ?.toLowerCase()
          .includes(searchValue) ||
        banner.buttonText
          ?.toLowerCase()
          .includes(searchValue) ||
        banner.buttonLink
          ?.toLowerCase()
          .includes(searchValue)
      );
    })
    .filter((banner) => {
      if (statusFilter === "active") {
        return banner.isActive;
      }

      if (statusFilter === "inactive") {
        return !banner.isActive;
      }

      return true;
    })
    .filter((banner) => {
      if (typeFilter === "hero") {
        return (banner.type || "hero") === "hero";
      }

      if (typeFilter === "promotional") {
        return (
          (banner.type || "hero") ===
          "promotional"
        );
      }

      return true;
    })
    .sort(
      (a, b) =>
        Number(a.displayOrder || 0) -
        Number(b.displayOrder || 0)
    );

  // ================= COUNTS =================

  const heroCount = banners.filter(
    (banner) =>
      (banner.type || "hero") === "hero"
  ).length;

  const promotionalCount = banners.filter(
    (banner) =>
      (banner.type || "hero") ===
      "promotional"
  ).length;

  // ================= LOADING =================

  if (!isAuthLoaded) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading...
        </p>
      </main>
    );
  }

  // ================= UNAUTHORIZED =================

  if (!user || user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-gray-500">
          Redirecting...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Admin
            </p>

            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
              Banners
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage homepage banners and promotional content.
            </p>

          </div>

          <button
            type="button"
            onClick={handleAddBanner}
            className="bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            + Add Banner
          </button>

        </div>

        {/* ================= SUMMARY ================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-4">

          {/* TOTAL */}

          <div className="border border-gray-200 bg-white p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total Banners
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {banners.length}
            </p>

          </div>

          {/* HERO */}

          <div className="border border-gray-200 bg-white p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Hero Banners
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {heroCount}
            </p>

          </div>

          {/* PROMOTIONAL */}

          <div className="border border-gray-200 bg-white p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Promotional
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {promotionalCount}
            </p>

          </div>

          {/* ACTIVE */}

          <div className="border border-gray-200 bg-white p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Active Banners
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                banners.filter(
                  (banner) => banner.isActive
                ).length
              }
            </p>

          </div>

        </div>

        {/* ================= FILTERS ================= */}

        <div className="mb-6 border border-gray-200 bg-white p-4">

          <div className="grid gap-4 md:grid-cols-[1fr_220px_220px]">

            {/* SEARCH */}

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search banners..."
              className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />

            {/* TYPE FILTER */}

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value)
              }
              className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
            >

              <option value="all">
                All Types
              </option>

              <option value="hero">
                Hero Banner
              </option>

              <option value="promotional">
                Promotional Banner
              </option>

            </select>

            {/* STATUS FILTER */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
            >

              <option value="all">
                All Status
              </option>

              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>

            </select>

          </div>

        </div>

        {/* ================= BANNERS ================= */}

        {filteredBanners.length === 0 ? (

          <div className="border border-gray-200 bg-white px-6 py-16 text-center">

            <div className="text-5xl">
              🖼️
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No banners found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add your first banner to get started.
            </p>

            <button
              type="button"
              onClick={handleAddBanner}
              className="mt-6 bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              + Add Banner
            </button>

          </div>

        ) : (

          <div className="grid gap-5 lg:grid-cols-2">

            {filteredBanners.map((banner) => {

              const bannerType =
                banner.type || "hero";

              return (
                <div
                  key={banner.id}
                  className="overflow-hidden border border-gray-200 bg-white"
                >

                  {/* ================= IMAGE ================= */}

                  <div className="relative aspect-[16/7] overflow-hidden bg-gray-100">

                    {banner.image ? (

                      <img
                        src={banner.image}
                        alt={
                          banner.title ||
                          "Banner"
                        }
                        className="h-full w-full object-cover"
                      />

                    ) : (

                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No Image
                      </div>

                    )}

                    {/* TYPE */}

                    <span
                      className={`absolute left-3 top-3 border px-3 py-1 text-xs font-medium ${
                        bannerType === "hero"
                          ? "border-blue-200 bg-blue-50 text-blue-700"
                          : "border-purple-200 bg-purple-50 text-purple-700"
                      }`}
                    >
                      {bannerType === "hero"
                        ? "Hero Banner"
                        : "Promotional Banner"}
                    </span>

                    {/* STATUS */}

                    <span
                      className={`absolute right-3 top-3 border px-3 py-1 text-xs font-medium ${
                        banner.isActive
                          ? "border-green-200 bg-green-50 text-green-700"
                          : "border-gray-200 bg-white text-gray-600"
                      }`}
                    >
                      {banner.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                  </div>

                  {/* ================= CONTENT ================= */}

                  <div className="p-5">

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <h2 className="text-lg font-semibold">
                          {banner.title ||
                            "Image Banner"}
                        </h2>

                        {banner.subtitle && (
                          <p className="mt-1 text-sm text-gray-500">
                            {banner.subtitle}
                          </p>
                        )}

                      </div>

                      <span className="flex-shrink-0 text-xs text-gray-400">
                        Order{" "}
                        {banner.displayOrder}
                      </span>

                    </div>

                    {/* BUTTON INFO */}

                    {(banner.buttonText ||
                      banner.buttonLink) && (

                      <div className="mt-4 border-t pt-4">

                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          Button
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {banner.buttonText ||
                            "—"}
                        </p>

                        {banner.buttonLink && (
                          <p className="mt-1 break-all text-xs text-gray-400">
                            {banner.buttonLink}
                          </p>
                        )}

                      </div>

                    )}

                    {/* ACTIONS */}

                    <div className="mt-5 grid grid-cols-3 gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(
                            banner
                          )
                        }
                        className="border border-gray-300 px-3 py-2 text-xs font-medium transition hover:border-black hover:bg-black hover:text-white"
                      >
                        {banner.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEditBanner(
                            banner
                          )
                        }
                        className="border border-gray-300 px-3 py-2 text-xs font-medium transition hover:border-black hover:bg-black hover:text-white"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteBanner(
                            banner
                          )
                        }
                        className="border border-red-300 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

      {/* ================================================== */}
      {/* ADD / EDIT BANNER MODAL */}
      {/* ================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white">

            {/* ================= HEADER ================= */}

            <div className="flex items-center justify-between border-b px-5 py-4">

              <div>

                <h2 className="text-lg font-semibold">
                  {editingBanner
                    ? "Edit Banner"
                    : "Add Banner"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Manage homepage banner content.
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="text-xl text-gray-500 hover:text-black"
                aria-label="Close"
              >
                ✕
              </button>

            </div>

            {/* ================= BODY ================= */}

            <div className="space-y-5 p-5">

              {/* ================= BANNER TYPE ================= */}

              <div>

                <label className="mb-2 block text-sm font-medium">

                  Banner Type

                  <span className="ml-1 text-red-500">
                    *
                  </span>

                </label>

                <select
                  value={formData.type}
                  onChange={(event) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        type:
                          event.target.value,
                      })
                    )
                  }
                  className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                >

                  <option value="hero">
                    Hero Banner
                  </option>

                  <option value="promotional">
                    Promotional Banner
                  </option>

                </select>

                <p className="mt-1 text-xs text-gray-500">
                  Choose where this banner should appear on the homepage.
                </p>

              </div>

              {/* ================= IMAGE ================= */}

              <div>

                <label className="mb-2 block text-sm font-medium">

                  Banner Image

                  <span className="ml-1 text-red-500">
                    *
                  </span>

                </label>

                <label className="flex min-h-48 cursor-pointer items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center transition hover:border-black">

                  {formData.image ? (

                    <div className="w-full">

                      <img
                        src={
                          formData.image
                        }
                        alt="Banner preview"
                        className="mx-auto h-48 w-full object-cover"
                      />

                      <p className="mt-3 text-xs text-gray-500">
                        Click to replace image
                      </p>

                    </div>

                  ) : (

                    <div>

                      <div className="text-3xl">
                        🖼️
                      </div>

                      <p className="mt-2 text-sm font-medium">
                        Upload Banner Image
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        JPG, JPEG, PNG or WEBP · Max 5MB
                      </p>

                    </div>

                  )}

                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={
                      handleImageUpload
                    }
                    className="hidden"
                  />

                </label>

              </div>

              {/* ================= TITLE ================= */}

              <div>

                <label className="mb-2 block text-sm font-medium">

                  Banner Title

                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (Optional)
                  </span>

                </label>

                <input
                  type="text"
                  value={formData.title}
                  onChange={(event) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        title:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Optional"
                  className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                />

              </div>

              {/* ================= SUBTITLE ================= */}

              <div>

                <label className="mb-2 block text-sm font-medium">

                  Subtitle

                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (Optional)
                  </span>

                </label>

                <textarea
                  value={
                    formData.subtitle
                  }
                  onChange={(event) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        subtitle:
                          event.target.value,
                      })
                    )
                  }
                  rows={3}
                  placeholder="Optional"
                  className="w-full resize-none border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                />

              </div>

              {/* ================= BUTTON ================= */}

              <div className="grid gap-4 sm:grid-cols-2">

                <div>

                  <label className="mb-2 block text-sm font-medium">

                    Button Text

                    <span className="ml-1 text-xs font-normal text-gray-400">
                      (Optional)
                    </span>

                  </label>

                  <input
                    type="text"
                    value={
                      formData.buttonText
                    }
                    onChange={(event) =>
                      setFormData(
                        (current) => ({
                          ...current,
                          buttonText:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="Optional"
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium">

                    Button Link

                    <span className="ml-1 text-xs font-normal text-gray-400">
                      (Optional)
                    </span>

                  </label>

                  <input
                    type="text"
                    value={
                      formData.buttonLink
                    }
                    onChange={(event) =>
                      setFormData(
                        (current) => ({
                          ...current,
                          buttonLink:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="/shop or any link"
                    className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                  />

                </div>

              </div>

              {/* ================= ORDER ================= */}

              <div>

                <label className="mb-2 block text-sm font-medium">

                  Display Order

                  <span className="ml-1 text-xs font-normal text-gray-400">
                    (Optional)
                  </span>

                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    formData.displayOrder || ""
                  }
                  onChange={(event) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        displayOrder:
                          event.target.value,
                      })
                    )
                  }
                  placeholder="Optional"
                  className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Lower numbers appear first. If empty, the banner is added at the end.
                </p>

              </div>

              {/* ================= ACTIVE ================= */}

              <label className="flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  checked={
                    formData.isActive
                  }
                  onChange={(event) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        isActive:
                          event.target.checked,
                      })
                    )
                  }
                  className="h-4 w-4"
                />

                <span className="text-sm font-medium">
                  Active Banner
                </span>

              </label>

              {/* ================= ERROR ================= */}

              {error && (

                <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>

              )}

            </div>

            {/* ================= FOOTER ================= */}

            <div className="flex flex-col-reverse gap-3 border-t p-5 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setError("");
                }}
                className="border border-gray-300 px-5 py-3 text-sm font-medium transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleSaveBanner
                }
                className="bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                {editingBanner
                  ? "Update Banner"
                  : "Save Banner"}
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}