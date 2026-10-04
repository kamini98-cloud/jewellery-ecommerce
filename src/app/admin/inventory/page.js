"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import defaultProducts from "@/data/products";
import { useAuth } from "@/context/AuthContext";

const INVENTORY_KEY = "adminInventory";
const NOTIFICATION_KEY = "adminNotifications";

export default function InventoryPage() {
  const router = useRouter();
  const { user, isAuthLoaded } = useAuth();

  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState({});

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");

  // ============================
  // ADMIN PROTECTION
  // ============================

  useEffect(() => {
    if (!isAuthLoaded) return;

    if (!user || user.role !== "admin") {
      router.replace("/admin/login");
    }
  }, [isAuthLoaded, user, router]);

  // ============================
  // LOAD PRODUCTS + INVENTORY
  // ============================

  useEffect(() => {
    if (!isAuthLoaded || !user || user.role !== "admin") {
      return;
    }

    const savedProducts =
      localStorage.getItem("adminProducts");

    const savedInventory =
      localStorage.getItem(INVENTORY_KEY);

    const productList = savedProducts
      ? JSON.parse(savedProducts)
      : defaultProducts;

    const existingInventory = savedInventory
      ? JSON.parse(savedInventory)
      : {};

    const updatedInventory = {
      ...existingInventory,
    };

    productList.forEach((product) => {
      const productId = String(product.id);

      if (
        updatedInventory[productId] ===
        undefined
      ) {
        if (
          product.stockQuantity !==
          undefined
        ) {
          updatedInventory[productId] =
            Number(
              product.stockQuantity
            );
        } else if (
          product.stock !==
          undefined
        ) {
          updatedInventory[productId] =
            Number(product.stock);
        } else {
          updatedInventory[productId] =
            product.inStock
              ? 10
              : 0;
        }
      }
    });

    setProducts(productList);
    setInventory(updatedInventory);

    localStorage.setItem(
      INVENTORY_KEY,
      JSON.stringify(
        updatedInventory
      )
    );
  }, [isAuthLoaded, user]);

  // ============================
  // CREATE STOCK NOTIFICATION
  // ============================

  const createStockNotification = (
    product,
    type,
    quantity
  ) => {
    try {
      const storedNotifications =
        localStorage.getItem(
          NOTIFICATION_KEY
        );

      let notifications = [];

      if (storedNotifications) {
        try {
          const parsedNotifications =
            JSON.parse(
              storedNotifications
            );

          if (
            Array.isArray(
              parsedNotifications
            )
          ) {
            notifications =
              parsedNotifications;
          }
        } catch (error) {
          console.error(
            "Failed to parse notifications:",
            error
          );
        }
      }

      // ============================
      // LOW STOCK
      // ============================

      if (
        type === "low-stock"
      ) {
        const notification = {
          id:
            typeof crypto !== "undefined" &&
            crypto.randomUUID
              ? `NOTIF-${crypto.randomUUID()}`
              : `NOTIF-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2)}`,

          type: "low-stock",

          title: "Low Stock Alert",

          message: `${product.name} is running low on stock. Only ${quantity} item${
            quantity === 1
              ? ""
              : "s"
          } remaining.`,

          productId: product.id,

          productName:
            product.name,

          quantity,

          createdAt:
            new Date().toISOString(),

          isRead: false,
        };

        notifications = [
          notification,
          ...notifications,
        ];
      }

      // ============================
      // OUT OF STOCK
      // ============================

      if (
        type === "out-of-stock"
      ) {
        const notification = {
          id:
            typeof crypto !== "undefined" &&
            crypto.randomUUID
              ? `NOTIF-${crypto.randomUUID()}`
              : `NOTIF-${Date.now()}-${Math.random()
                  .toString(36)
                  .slice(2)}`,

          type: "out-of-stock",

          title: "Product Out of Stock",

          message: `${product.name} is now out of stock.`,

          productId: product.id,

          productName:
            product.name,

          quantity: 0,

          createdAt:
            new Date().toISOString(),

          isRead: false,
        };

        notifications = [
          notification,
          ...notifications,
        ];
      }

      localStorage.setItem(
        NOTIFICATION_KEY,
        JSON.stringify(
          notifications
        )
      );
    } catch (error) {
      console.error(
        "Failed to create stock notification:",
        error
      );
    }
  };

  // ============================
  // UPDATE STOCK
  // ============================

  const updateStock = (
    productId,
    change
  ) => {
    const id = String(productId);

    setInventory(
      (currentInventory) => {
        const currentStock =
          Number(
            currentInventory[id] || 0
          );

        const newStock = Math.max(
          0,
          currentStock + change
        );

        const updatedInventory = {
          ...currentInventory,
          [id]: newStock,
        };

        localStorage.setItem(
          INVENTORY_KEY,
          JSON.stringify(
            updatedInventory
          )
        );

        // ============================
        // FIND PRODUCT
        // ============================

        const product =
          products.find(
            (item) =>
              String(item.id) ===
              id
          );

        if (product) {
          // ============================
          // LOW STOCK NOTIFICATION
          // ONLY WHEN CROSSING 5
          // ============================

          if (
            currentStock > 5 &&
            newStock > 0 &&
            newStock <= 5
          ) {
            createStockNotification(
              product,
              "low-stock",
              newStock
            );
          }

          // ============================
          // OUT OF STOCK NOTIFICATION
          // ONLY WHEN REACHING 0
          // ============================

          if (
            currentStock > 0 &&
            newStock === 0
          ) {
            createStockNotification(
              product,
              "out-of-stock",
              0
            );
          }
        }

        return updatedInventory;
      }
    );
  };

  // ============================
  // GET STOCK STATUS
  // ============================

  const getStockStatus = (
    quantity
  ) => {
    if (quantity === 0) {
      return {
        label: "Out of Stock",
        className:
          "bg-red-100 text-red-700",
      };
    }

    if (quantity <= 5) {
      return {
        label: "Low Stock",
        className:
          "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "In Stock",
      className:
        "bg-green-100 text-green-700",
    };
  };

  // ============================
  // FILTER PRODUCTS
  // ============================

  const filteredProducts =
    useMemo(() => {
      return products.filter(
        (product) => {
          const quantity =
            Number(
              inventory[
                String(product.id)
              ] || 0
            );

          const searchText =
            search.toLowerCase();

          const matchesSearch =
            product.name
              ?.toLowerCase()
              .includes(
                searchText
              ) ||
            product.category
              ?.toLowerCase()
              .includes(
                searchText
              );

          let matchesStock =
            true;

          if (
            stockFilter ===
            "in-stock"
          ) {
            matchesStock =
              quantity > 5;
          }

          if (
            stockFilter ===
            "low-stock"
          ) {
            matchesStock =
              quantity > 0 &&
              quantity <= 5;
          }

          if (
            stockFilter ===
            "out-of-stock"
          ) {
            matchesStock =
              quantity === 0;
          }

          return (
            matchesSearch &&
            matchesStock
          );
        }
      );
    }, [
      products,
      inventory,
      search,
      stockFilter,
    ]);

  // ============================
  // SUMMARY
  // ============================

  const totalProducts =
    products.length;

  const totalStock =
    Object.values(
      inventory
    ).reduce(
      (
        total,
        quantity
      ) =>
        total +
        Number(
          quantity || 0
        ),
      0
    );

  const lowStockCount =
    products.filter(
      (product) => {
        const quantity =
          Number(
            inventory[
              String(product.id)
            ] || 0
          );

        return (
          quantity > 0 &&
          quantity <= 5
        );
      }
    ).length;

  const outOfStockCount =
    products.filter(
      (product) => {
        const quantity =
          Number(
            inventory[
              String(product.id)
            ] || 0
          );

        return quantity === 0;
      }
    ).length;

  // ============================
  // LOADING / AUTH
  // ============================

  if (
    !isAuthLoaded ||
    !user ||
    user.role !== "admin"
  ) {
    return null;
  }

  // ============================
  // PAGE
  // ============================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ============================
          HEADER
      ============================ */}

      <div className="border-b bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>

            <Link
              href="/admin"
              className="text-sm text-gray-500 hover:text-black"
            >
              ← Back to Dashboard
            </Link>

            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Inventory Management
            </h1>

          </div>

          <Link
            href="/admin/products"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Manage Products
          </Link>

        </div>

      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">

        {/* ============================
            SUMMARY CARDS
        ============================ */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border bg-white p-5">

            <p className="text-sm text-gray-500">
              Total Products
            </p>

            <p className="mt-2 text-2xl font-bold">
              {totalProducts}
            </p>

          </div>

          <div className="rounded-xl border bg-white p-5">

            <p className="text-sm text-gray-500">
              Total Stock
            </p>

            <p className="mt-2 text-2xl font-bold">
              {totalStock}
            </p>

          </div>

          <div className="rounded-xl border bg-white p-5">

            <p className="text-sm text-gray-500">
              Low Stock
            </p>

            <p className="mt-2 text-2xl font-bold text-yellow-600">
              {lowStockCount}
            </p>

          </div>

          <div className="rounded-xl border bg-white p-5">

            <p className="text-sm text-gray-500">
              Out of Stock
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {outOfStockCount}
            </p>

          </div>

        </div>

        {/* ============================
            FILTERS
        ============================ */}

        <div className="mb-6 rounded-xl border bg-white p-4">

          <div className="flex flex-col gap-4 md:flex-row">

            <div className="flex-1">

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Search products..."
                className="w-full rounded-lg border px-4 py-2 outline-none focus:border-black"
              />

            </div>

            <div className="w-full md:w-56">

              <label className="mb-1 block text-sm font-medium text-gray-700">
                Stock Status
              </label>

              <select
                value={
                  stockFilter
                }
                onChange={(e) =>
                  setStockFilter(
                    e.target.value
                  )
                }
                className="w-full rounded-lg border px-4 py-2 outline-none focus:border-black"
              >

                <option value="all">
                  All
                </option>

                <option value="in-stock">
                  In Stock
                </option>

                <option value="low-stock">
                  Low Stock
                </option>

                <option value="out-of-stock">
                  Out of Stock
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* ============================
            INVENTORY TABLE
        ============================ */}

        <div className="overflow-hidden rounded-xl border bg-white">

          <div className="border-b px-5 py-4">

            <h2 className="font-semibold text-gray-900">
              Product Inventory
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage stock quantity for each product.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[800px]">

              <thead className="bg-gray-50">

                <tr className="border-b text-left text-sm text-gray-600">

                  <th className="px-5 py-3">
                    Product
                  </th>

                  <th className="px-5 py-3">
                    Category
                  </th>

                  <th className="px-5 py-3 text-center">
                    Current Stock
                  </th>

                  <th className="px-5 py-3 text-center">
                    Status
                  </th>

                  <th className="px-5 py-3 text-center">
                    Update Stock
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredProducts.length >
                0 ? (

                  filteredProducts.map(
                    (product) => {

                      const productId =
                        String(
                          product.id
                        );

                      const quantity =
                        Number(
                          inventory[
                            productId
                          ] || 0
                        );

                      const status =
                        getStockStatus(
                          quantity
                        );

                      return (
                        <tr
                          key={
                            product.id
                          }
                          className="border-b last:border-b-0 hover:bg-gray-50"
                        >

                          {/* PRODUCT */}

                          <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="h-14 w-14 overflow-hidden rounded-lg border bg-gray-100">

                                {product.image ? (

                                  <img
                                    src={
                                      product.image
                                    }
                                    alt={
                                      product.name
                                    }
                                    className="h-full w-full object-cover"
                                  />

                                ) : (

                                  <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                    No Image
                                  </div>

                                )}

                              </div>

                              <div>

                                <p className="font-medium text-gray-900">
                                  {
                                    product.name
                                  }
                                </p>

                                <p className="text-xs text-gray-500">
                                  ID:{" "}
                                  {
                                    product.id
                                  }
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* CATEGORY */}

                          <td className="px-5 py-4 text-sm text-gray-600">
                            {
                              product.category ||
                              "-"
                            }
                          </td>

                          {/* CURRENT STOCK */}

                          <td className="px-5 py-4 text-center">

                            <span
                              className={`text-lg font-bold ${
                                quantity ===
                                0
                                  ? "text-red-600"
                                  : quantity <=
                                      5
                                    ? "text-yellow-600"
                                    : "text-gray-900"
                              }`}
                            >
                              {
                                quantity
                              }
                            </span>

                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-4 text-center">

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                            >
                              {
                                status.label
                              }
                            </span>

                          </td>

                          {/* UPDATE */}

                          <td className="px-5 py-4">

                            <div className="flex items-center justify-center gap-3">

                              <button
                                type="button"
                                onClick={() =>
                                  updateStock(
                                    product.id,
                                    -1
                                  )
                                }
                                disabled={
                                  quantity ===
                                  0
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg border text-lg font-semibold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                −
                              </button>

                              <span className="w-8 text-center font-semibold">
                                {
                                  quantity
                                }
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  updateStock(
                                    product.id,
                                    1
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-lg font-semibold text-white hover:bg-gray-800"
                              >
                                +
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="5"
                      className="px-5 py-12 text-center"
                    >

                      <p className="font-medium text-gray-700">
                        No products found
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Try changing your search or stock filter.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}