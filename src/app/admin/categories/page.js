"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const CATEGORY_KEY = "adminCategories";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user, isAuthLoaded } = useAuth();

  // ================= STATES =================

  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [showModal, setShowModal] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [formData, setFormData] = useState({
    name: "",
    image: "",
    isActive: true,
    displayOrder: 1,
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

  // ================= LOAD CATEGORIES =================

  useEffect(() => {
    if (!isAuthLoaded || !user) {
      return;
    }

    try {
      const stored =
        localStorage.getItem(CATEGORY_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setCategories(parsed);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load categories:",
        error
      );
    }
  }, [isAuthLoaded, user]);

  // ================= SAVE CATEGORIES =================

  const saveCategories = (updatedCategories) => {
    setCategories(updatedCategories);

    localStorage.setItem(
      CATEGORY_KEY,
      JSON.stringify(updatedCategories)
    );
  };

  // ================= OPEN ADD MODAL =================

  const handleAddCategory = () => {
    setEditingCategory(null);

    setFormData({
      name: "",
      image: "",
      isActive: true,
      displayOrder:
        categories.length + 1,
    });

    setError("");
    setShowModal(true);
  };

  // ================= OPEN EDIT MODAL =================

  const handleEditCategory = (category) => {
    setEditingCategory(category);

    setFormData({
      name: category.name || "",
      image: category.image || "",
      isActive:
        category.isActive !== false,
      displayOrder:
        category.displayOrder || 1,
    });

    setError("");
    setShowModal(true);
  };

  // ================= IMAGE UPLOAD =================

  const handleImageUpload = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    // Allowed formats
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
      setError(
        "Image size must be less than 5MB."
      );
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

  // ================= SAVE CATEGORY =================

  const handleSaveCategory = () => {
    const name =
      formData.name.trim();

    if (!name) {
      setError(
        "Please enter category name."
      );
      return;
    }

    if (!formData.image) {
      setError(
        "Please upload category image."
      );
      return;
    }

    const displayOrder =
      Number(formData.displayOrder);

    if (
      !Number.isInteger(displayOrder) ||
      displayOrder < 1
    ) {
      setError(
        "Display order must be a positive number."
      );
      return;
    }

    // Prevent duplicate category names
    const duplicateCategory =
      categories.find(
        (category) =>
          category.name
            ?.trim()
            .toLowerCase() ===
            name.toLowerCase() &&
          category.id !==
            editingCategory?.id
      );

    if (duplicateCategory) {
      setError(
        "A category with this name already exists."
      );
      return;
    }

    // ================= EDIT =================

    if (editingCategory) {
      const updatedCategories =
        categories.map(
          (category) =>
            category.id ===
            editingCategory.id
              ? {
                  ...category,
                  name,
                  image:
                    formData.image,
                  isActive:
                    formData.isActive,
                  displayOrder,
                  updatedAt:
                    new Date().toISOString(),
                }
              : category
        );

      saveCategories(
        updatedCategories
      );
    }

    // ================= ADD =================

    else {
      const newCategory = {
        id:
          typeof crypto !== "undefined" &&
          crypto.randomUUID
            ? `CAT-${crypto.randomUUID()}`
            : `CAT-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`,

        name,

        image:
          formData.image,

        isActive:
          formData.isActive,

        displayOrder,

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),
      };

      saveCategories([
        ...categories,
        newCategory,
      ]);
    }

    setShowModal(false);
    setEditingCategory(null);
    setError("");
  };

  // ================= DELETE CATEGORY =================

  const handleDeleteCategory = (category) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${category.name}"?`
      );

    if (!confirmed) {
      return;
    }

    const updatedCategories =
      categories.filter(
        (item) =>
          item.id !== category.id
      );

    saveCategories(
      updatedCategories
    );
  };

  // ================= TOGGLE STATUS =================

  const handleToggleStatus = (category) => {
    const updatedCategories =
      categories.map(
        (item) =>
          item.id === category.id
            ? {
                ...item,
                isActive:
                  !item.isActive,
                updatedAt:
                  new Date().toISOString(),
              }
            : item
      );

    saveCategories(
      updatedCategories
    );
  };

  // ================= FILTER =================

  const filteredCategories =
    categories
      .filter((category) => {
        const searchValue =
          search.trim().toLowerCase();

        if (!searchValue) {
          return true;
        }

        return category.name
          ?.toLowerCase()
          .includes(searchValue);
      })
      .filter((category) => {
        if (
          statusFilter === "active"
        ) {
          return category.isActive;
        }

        if (
          statusFilter === "inactive"
        ) {
          return !category.isActive;
        }

        return true;
      })
      .sort(
        (a, b) =>
          Number(a.displayOrder || 0) -
          Number(b.displayOrder || 0)
      );

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

      {/* ================= HEADER ================= */}

      <div className="mx-auto max-w-7xl">

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Admin
            </p>

            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
              Categories
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your store categories and category images.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddCategory}
            className="bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            + Add Category
          </button>

        </div>

        {/* ================= SUMMARY ================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-3">

          <div className="border border-gray-200 bg-white p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total Categories
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {categories.length}
            </p>

          </div>

          <div className="border border-gray-200 bg-white p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Active Categories
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                categories.filter(
                  (category) =>
                    category.isActive
                ).length
              }
            </p>

          </div>

          <div className="border border-gray-200 bg-white p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Inactive Categories
            </p>

            <p className="mt-2 text-2xl font-semibold">
              {
                categories.filter(
                  (category) =>
                    !category.isActive
                ).length
              }
            </p>

          </div>

        </div>

        {/* ================= FILTERS ================= */}

        <div className="mb-6 border border-gray-200 bg-white p-4">

          <div className="grid gap-4 md:grid-cols-[1fr_220px]">

            {/* SEARCH */}

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search categories..."
              className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
            />

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
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

        {/* ================= CATEGORY LIST ================= */}

        {filteredCategories.length ===
        0 ? (

          <div className="border border-gray-200 bg-white px-6 py-16 text-center">

            <div className="text-5xl">
              🗂️
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              No categories found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Add your first category to get started.
            </p>

            <button
              type="button"
              onClick={handleAddCategory}
              className="mt-6 bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              + Add Category
            </button>

          </div>

        ) : (

          <div className="overflow-hidden border border-gray-200 bg-white">

            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full border-collapse">

                <thead>
                  <tr className="border-b bg-gray-50 text-left">

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Image
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Category
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Order
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredCategories.map(
                    (category) => (

                      <tr
                        key={category.id}
                        className="border-b last:border-b-0"
                      >

                        {/* IMAGE */}

                        <td className="px-5 py-4">

                          <div className="h-16 w-20 overflow-hidden bg-gray-100">

                            {category.image ? (
                              <img
                                src={
                                  category.image
                                }
                                alt={
                                  category.name
                                }
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                No Image
                              </div>
                            )}

                          </div>

                        </td>

                        {/* NAME */}

                        <td className="px-5 py-4">

                          <p className="font-medium">
                            {category.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {category.id}
                          </p>

                        </td>

                        {/* ORDER */}

                        <td className="px-5 py-4 text-sm">
                          {category.displayOrder}
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(
                                category
                              )
                            }
                            className={`border px-3 py-1 text-xs font-medium ${
                              category.isActive
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-gray-200 bg-gray-50 text-gray-600"
                            }`}
                          >
                            {category.isActive
                              ? "Active"
                              : "Inactive"}
                          </button>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                handleEditCategory(
                                  category
                                )
                              }
                              className="border border-gray-300 px-4 py-2 text-xs font-medium transition hover:border-black hover:bg-black hover:text-white"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteCategory(
                                  category
                                )
                              }
                              className="border border-red-300 px-4 py-2 text-xs font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
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

            {/* MOBILE CARDS */}

            <div className="divide-y md:hidden">

              {filteredCategories.map(
                (category) => (

                  <div
                    key={category.id}
                    className="p-4"
                  >

                    <div className="flex gap-4">

                      <div className="h-20 w-24 flex-shrink-0 overflow-hidden bg-gray-100">

                        {category.image ? (
                          <img
                            src={
                              category.image
                            }
                            alt={
                              category.name
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-400">
                            No Image
                          </div>
                        )}

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="font-medium">
                          {category.name}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Order:{" "}
                          {category.displayOrder}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            handleToggleStatus(
                              category
                            )
                          }
                          className={`mt-2 border px-3 py-1 text-xs font-medium ${
                            category.isActive
                              ? "border-green-200 bg-green-50 text-green-700"
                              : "border-gray-200 bg-gray-50 text-gray-600"
                          }`}
                        >
                          {category.isActive
                            ? "Active"
                            : "Inactive"}
                        </button>

                      </div>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">

                      <button
                        type="button"
                        onClick={() =>
                          handleEditCategory(
                            category
                          )
                        }
                        className="border border-gray-300 px-4 py-2 text-xs font-medium"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteCategory(
                            category
                          )
                        }
                        className="border border-red-300 px-4 py-2 text-xs font-medium text-red-600"
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      </div>

      {/* ================================================== */}
      {/* ADD / EDIT CATEGORY MODAL */}
      {/* ================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b px-5 py-4">

              <div>

                <h2 className="text-lg font-semibold">
                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Manage category information and image.
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

            {/* MODAL BODY */}

            <div className="space-y-5 p-5">

              {/* CATEGORY NAME */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Category Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData(
                      (current) => ({
                        ...current,
                        name: event.target.value,
                      })
                    )
                  }
                  placeholder="Enter category name"
                  className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                />

              </div>

              {/* IMAGE */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Category Image
                </label>

                <label className="flex min-h-40 cursor-pointer items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-center transition hover:border-black">

                  {formData.image ? (

                    <div className="w-full">

                      <img
                        src={
                          formData.image
                        }
                        alt="Category preview"
                        className="mx-auto h-40 w-full object-cover"
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
                        Upload Category Image
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        JPG, JPEG, PNG or WEBP
                        · Max 5MB
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

              {/* DISPLAY ORDER */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Display Order
                </label>

                <input
                  type="number"
                  min="1"
                  value={
                    formData.displayOrder
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
                  className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                />

                <p className="mt-1 text-xs text-gray-500">
                  Lower numbers appear first.
                </p>

              </div>

              {/* ACTIVE */}

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
                  Active Category
                </span>

              </label>

              {/* ERROR */}

              {error && (

                <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>

              )}

            </div>

            {/* MODAL FOOTER */}

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
                  handleSaveCategory
                }
                className="bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                {editingCategory
                  ? "Update Category"
                  : "Save Category"}
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}