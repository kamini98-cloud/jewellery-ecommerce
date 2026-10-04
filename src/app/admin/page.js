"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboardPage() {
  const router = useRouter();

  const { user, isAuthLoaded } = useAuth();

  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState({});
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // ============================
  // LOAD DASHBOARD DATA
  // ============================

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    if (!user || user.role !== "admin") {
      router.replace("/admin/login");
      return;
    }

    const loadDashboardData = () => {
      // ============================
      // PRODUCTS
      // ============================

      let adminProducts = [];

      try {
        const storedProducts =
          localStorage.getItem("adminProducts");

        if (storedProducts) {
          const parsedProducts =
            JSON.parse(storedProducts);

          if (Array.isArray(parsedProducts)) {
            adminProducts = parsedProducts;
          }
        }
      } catch (error) {
        console.error(
          "Failed to load admin products:",
          error
        );
      }

      setProducts(adminProducts);

      // ============================
      // INVENTORY
      // ============================

      let adminInventory = {};

      try {
        const storedInventory =
          localStorage.getItem("adminInventory");

        if (storedInventory) {
          const parsedInventory =
            JSON.parse(storedInventory);

          if (
            parsedInventory &&
            typeof parsedInventory === "object"
          ) {
            adminInventory = parsedInventory;
          }
        }
      } catch (error) {
        console.error(
          "Failed to load admin inventory:",
          error
        );
      }

      setInventory(adminInventory);

      // ============================
      // ORDERS
      // ============================

      let adminOrders = [];

      try {
        const storedOrders =
          localStorage.getItem("adminOrders");

        if (storedOrders) {
          const parsedOrders =
            JSON.parse(storedOrders);

          if (Array.isArray(parsedOrders)) {
            adminOrders = parsedOrders;
          }
        }
      } catch (error) {
        console.error(
          "Failed to load admin orders:",
          error
        );
      }

      // Remove duplicate orders

      const uniqueOrders = Array.from(
        new Map(
          adminOrders.map((order) => [
            order.id,
            order,
          ])
        ).values()
      );

      // Newest first

      uniqueOrders.sort(
        (a, b) =>
          new Date(b.orderDate || 0) -
          new Date(a.orderDate || 0)
      );

      setOrders(uniqueOrders);

      // ============================
      // COUPONS
      // ============================

      let adminCoupons = [];

      try {
        const storedCoupons =
          localStorage.getItem("adminCoupons");

        if (storedCoupons) {
          const parsedCoupons =
            JSON.parse(storedCoupons);

          if (Array.isArray(parsedCoupons)) {
            adminCoupons = parsedCoupons;
          }
        }
      } catch (error) {
        console.error(
          "Failed to load admin coupons:",
          error
        );
      }

      setCoupons(adminCoupons);
    };

    loadDashboardData();

    // ============================
    // STORAGE CHANGE
    // ============================

    window.addEventListener(
      "storage",
      loadDashboardData
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadDashboardData
      );
    };
  }, [isAuthLoaded, user, router]);

  // ============================
  // TOTAL PRODUCTS
  // ============================

  const totalProducts = products.length;

  // ============================
  // TOTAL STOCK
  // ============================

  const totalStock = useMemo(() => {
    return products.reduce(
      (total, product) => {
        const quantity =
          Number(
            inventory[product.id]
          ) || 0;

        return total + quantity;
      },
      0
    );
  }, [products, inventory]);

  // ============================
  // LOW STOCK PRODUCTS
  // ============================

  const lowStockProducts = useMemo(() => {
    return products.filter((product) => {
      const quantity =
        Number(
          inventory[product.id]
        ) || 0;

      return (
        quantity > 0 &&
        quantity <= 5
      );
    });
  }, [products, inventory]);

  // ============================
  // OUT OF STOCK PRODUCTS
  // ============================

  const outOfStockProducts = useMemo(() => {
    return products.filter((product) => {
      const quantity =
        Number(
          inventory[product.id]
        ) || 0;

      return quantity === 0;
    });
  }, [products, inventory]);

  // ============================
  // TOTAL ORDERS
  // ============================

  const totalOrders = orders.length;

  // ============================
  // TOTAL REVENUE
  // ============================
  // Cancelled orders are not counted
  // as revenue.

  const totalRevenue = useMemo(() => {
    return orders.reduce(
      (total, order) => {
        if (
          order.status === "Cancelled"
        ) {
          return total;
        }

        return (
          total +
          Number(order.total || 0)
        );
      },
      0
    );
  }, [orders]);

  // ============================
  // RECENT ORDERS
  // ============================

  const recentOrders = useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  // ============================
  // COUPON OVERVIEW
  // ============================

  const couponStats = useMemo(() => {
    const now = new Date();

    const activeCoupons = coupons.filter(
      (coupon) => {
        if (!coupon.isActive) {
          return false;
        }

        if (!coupon.expiryDate) {
          return true;
        }

        return (
          new Date(coupon.expiryDate) >= now
        );
      }
    );

    const expiredCoupons = coupons.filter(
      (coupon) => {
        if (!coupon.expiryDate) {
          return false;
        }

        return (
          new Date(coupon.expiryDate) < now
        );
      }
    );

    const inactiveCoupons = coupons.filter(
      (coupon) => !coupon.isActive
    );

    return {
      total: coupons.length,
      active: activeCoupons.length,
      expired: expiredCoupons.length,
      inactive: inactiveCoupons.length,
    };
  }, [coupons]);

  // ============================
  // RECENT COUPONS
  // ============================

  const recentCoupons = useMemo(() => {
    return [...coupons]
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0) -
          new Date(a.createdAt || 0)
      )
      .slice(0, 5);
  }, [coupons]);

  // ============================
  // STATUS STYLE
  // ============================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Placed":
        return "border-blue-200 bg-blue-50 text-blue-700";

      case "Confirmed":
        return "border-purple-200 bg-purple-50 text-purple-700";

      case "Shipped":
        return "border-yellow-200 bg-yellow-50 text-yellow-700";

      case "Out for Delivery":
        return "border-orange-200 bg-orange-50 text-orange-700";

      case "Delivered":
        return "border-green-200 bg-green-50 text-green-700";

      case "Cancelled":
        return "border-red-200 bg-red-50 text-red-700";

      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };

  // ============================
  // FORMAT DATE + TIME
  // ============================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
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
          Loading...
        </p>
      </main>
    );
  }

  // ============================
  // NOT ADMIN
  // ============================

  if (!user || user.role !== "admin") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Redirecting...
        </p>
      </main>
    );
  }

  // ============================
  // DASHBOARD
  // ============================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ================= HEADER ================= */}

      <div className="border-b bg-white">

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Admin Panel
              </p>

              <h1 className="mt-1 text-3xl font-semibold">
                Dashboard
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Manage your jewellery store.
              </p>

            </div>

            <div className="text-sm text-gray-500">
              Welcome,{" "}
              <span className="font-medium text-black">
                {user.name || "Admin"}
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* ================= CONTENT ================= */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ================= MAIN STATS ================= */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"> 

          {/* TOTAL PRODUCTS */}

          <div className="border border-gray-200 bg-white p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total Products
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {totalProducts}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Products in store
            </p>

          </div>














          {/* TOTAL ORDERS */}

          <div className="border border-gray-200 bg-white p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {totalOrders}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Customer orders
            </p>

          </div>

          {/* REVENUE */}

          <div className="border border-gray-200 bg-white p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Revenue
            </p>

            <p className="mt-2 text-3xl font-semibold">
              ₹
              {totalRevenue.toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Excluding cancelled orders
            </p>

          </div>

          {/* CUSTOMERS */}

          <div className="border border-gray-200 bg-white p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Customers
            </p>

            <p className="mt-2 text-3xl font-semibold">
              0
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Customer management coming next
            </p>

          </div>

        </div>

        {/* ================= INVENTORY OVERVIEW ================= */}

        <div className="mt-8">

          <div className="mb-4">

            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Inventory
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Inventory Overview
            </h2>

          </div>

          <div className="grid gap-4 sm:grid-cols-3">

            {/* TOTAL STOCK */}

            <div className="border border-gray-200 bg-white p-5">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Total Stock
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {totalStock}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Total units available
              </p>

            </div>

            {/* LOW STOCK */}

            <div className="border border-gray-200 bg-white p-5">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Low Stock
              </p>

              <p className="mt-2 text-3xl font-semibold text-yellow-600">
                {lowStockProducts.length}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Products with 1–5 units
              </p>

            </div>

            {/* OUT OF STOCK */}

            <div className="border border-gray-200 bg-white p-5">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Out of Stock
              </p>

              <p className="mt-2 text-3xl font-semibold text-red-600">
                {outOfStockProducts.length}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Products with 0 units
              </p>

            </div>

          </div>

        </div>

        {/* ================= QUICK ACTIONS ================= */}

        <div className="mt-8">

          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Manage Store
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Quick Actions
          </h2>
{/* 
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"> */}
< div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* PRODUCTS */}

            <Link
              href="/admin/products"
              className="border border-gray-200 bg-white p-5 transition hover:border-black"
            >

              <p className="font-medium">
                Products
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Manage your jewellery products
              </p>

              <p className="mt-5 text-xs font-medium">
                MANAGE →
              </p>

            </Link>


            {/* CATEGORIES */}

<Link
  href="/admin/categories"
  className="border border-gray-200 bg-white p-5 transition hover:border-black"
>

  <p className="font-medium">
    Categories
  </p>

  <p className="mt-2 text-sm text-gray-500">
    Manage product categories
  </p>

  <p className="mt-5 text-xs font-medium">
    MANAGE →
  </p>

</Link>

            {/* ORDERS */}

            <Link
              href="/admin/orders"
              className="border border-gray-200 bg-white p-5 transition hover:border-black"
            >

              <p className="font-medium">
                Orders
              </p>

              <p className="mt-2 text-sm text-gray-500">
                View and manage customer orders
              </p>

              <p className="mt-5 text-xs font-medium">
                MANAGE →
              </p>

            </Link>

            {/* INVENTORY */}

            <Link
              href="/admin/inventory"
              className="border border-gray-200 bg-white p-5 transition hover:border-black"
            >

              <p className="font-medium">
                Inventory
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Manage product stock
              </p>

              <p className="mt-5 text-xs font-medium">
                MANAGE →
              </p>

            </Link>

            {/* CUSTOMERS */}

            <Link
              href="/admin/customers"
              className="border border-gray-200 bg-white p-5 transition hover:border-black"
            >

              <p className="font-medium">
                Customers
              </p>

              <p className="mt-2 text-sm text-gray-500">
                View registered customers
              </p>

              <p className="mt-5 text-xs font-medium">
                MANAGE →
              </p>

            </Link>

          </div>

        </div>

        {/* ================= COUPONS ================= */}

        <div className="mt-8">

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Discounts
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Coupons Overview
              </h2>

            </div>

            <Link
              href="/admin/coupons"
              className="text-sm underline"
            >
              Manage Coupons
            </Link>

          </div>

          {/* COUPON STATS */}

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* TOTAL */}

            <div className="border border-gray-200 bg-white p-5">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Total Coupons
              </p>

              <p className="mt-2 text-3xl font-semibold">
                {couponStats.total}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                All coupons
              </p>

            </div>

            {/* ACTIVE */}

            <div className="border border-gray-200 bg-white p-5">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Active Coupons
              </p>

              <p className="mt-2 text-3xl font-semibold text-green-600">
                {couponStats.active}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Currently available
              </p>

            </div>

            {/* EXPIRED */}

            <div className="border border-gray-200 bg-white p-5">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Expired Coupons
              </p>

              <p className="mt-2 text-3xl font-semibold text-red-600">
                {couponStats.expired}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Past expiry date
              </p>

            </div>

            {/* INACTIVE */}

            <div className="border border-gray-200 bg-white p-5">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Inactive Coupons
              </p>

              <p className="mt-2 text-3xl font-semibold text-gray-600">
                {couponStats.inactive}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Manually disabled
              </p>

            </div>

          </div>

          {/* RECENT COUPONS */}

          <div className="mt-4 border border-gray-200 bg-white">

            {recentCoupons.length === 0 ? (

              <div className="px-6 py-10 text-center">

                <p className="font-medium">
                  No coupons yet
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Create coupons to see them here.
                </p>

              </div>

            ) : (

              <div className="divide-y">

                {recentCoupons.map((coupon) => {

                  const isExpired =
                    coupon.expiryDate &&
                    new Date(coupon.expiryDate) < new Date();

                  const discountText =
                    coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `₹${Number(
                          coupon.discountValue || 0
                        ).toLocaleString("en-IN")} OFF`;

                  let couponStatus = "Active";

                  let statusClass =
                    "border-green-200 bg-green-50 text-green-700";

                  if (!coupon.isActive) {

                    couponStatus = "Inactive";

                    statusClass =
                      "border-gray-200 bg-gray-50 text-gray-700";

                  } else if (isExpired) {

                    couponStatus = "Expired";

                    statusClass =
                      "border-red-200 bg-red-50 text-red-700";

                  }

                  return (
                    <div
                      key={coupon.id}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >

                      {/* COUPON INFO */}

                      <div className="min-w-0">

                        <p className="font-semibold">
                          {coupon.code}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {coupon.description ||
                            "No description"}
                        </p>

                      </div>

                      {/* COUPON DETAILS */}

                      <div className="flex flex-wrap items-center gap-4">

                        <div className="text-sm">

                          <p className="font-medium">
                            {discountText}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Min. order ₹
                            {Number(
                              coupon.minimumOrder || 0
                            ).toLocaleString("en-IN")}
                          </p>

                        </div>

                        {/* EXPIRY */}

                        <div className="text-xs text-gray-500">

                          {coupon.expiryDate
                            ? `Expires ${new Date(
                                coupon.expiryDate
                              ).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}`
                            : "No expiry"}

                        </div>

                        {/* STATUS */}

                        <span
                          className={`border px-3 py-1 text-xs font-medium ${statusClass}`}
                        >
                          {couponStatus}
                        </span>

                      </div>

                    </div>
                  );
                })}

              </div>

            )}

          </div>

        </div>

        {/* ================= RECENT ORDERS ================= */}

        <div className="mt-8">

          <div className="flex items-end justify-between">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Orders
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Recent Orders
              </h2>

            </div>

            {orders.length > 0 && (
              <Link
                href="/admin/orders"
                className="text-sm underline"
              >
                View All
              </Link>
            )}

          </div>

          <div className="mt-4 border border-gray-200 bg-white">

            {recentOrders.length === 0 ? (

              <div className="px-6 py-12 text-center">

                <div className="text-4xl">
                  📦
                </div>

                <h3 className="mt-4 font-semibold">
                  No orders yet
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Recent customer orders will appear here.
                </p>

              </div>

            ) : (

              <div className="divide-y">

                {recentOrders.map((order) => {

                  const customerName =
                    order.customer?.fullName ||
                    "Guest Customer";

                  const status =
                    order.status ||
                    "Placed";

                  return (
                    <div
                      key={order.id}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >

                      {/* ORDER INFO */}

                      <div className="min-w-0">

                        <p className="font-medium">
                          {order.id}
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          {customerName}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {formatDate(
                            order.orderDate
                          )}
                        </p>

                      </div>

                      {/* STATUS */}

                      <div className="flex flex-wrap items-center gap-4">

                        <span
                          className={`border px-3 py-1 text-xs font-medium ${getStatusStyle(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                        <p className="font-semibold">
                          ₹
                          {Number(
                            order.total || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </div>

                    </div>
                  );
                })}

              </div>

            )}

          </div>

        </div>

        {/* ================= LOW STOCK PRODUCTS ================= */}

        <div className="mt-8 pb-10">

          <div>

            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Inventory
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Low Stock Products
            </h2>

          </div>

          <div className="mt-4 border border-gray-200 bg-white">

            {lowStockProducts.length === 0 ? (

              <div className="px-6 py-12 text-center">

                <p className="font-medium">
                  No low stock products
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  All products have sufficient stock.
                </p>

              </div>

            ) : (

              <div className="divide-y">

                {lowStockProducts.map(
                  (product) => {

                    const currentStock =
                      Number(
                        inventory[product.id]
                      ) || 0;

                    return (

                      <div
                        key={product.id}
                        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                      >

                        {/* PRODUCT */}

                        <div className="flex min-w-0 items-center gap-4">

                          <div className="h-14 w-14 flex-shrink-0 overflow-hidden bg-gray-100">

                            {product.image ? (

                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />

                            ) : (

                              <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                No Image
                              </div>

                            )}

                          </div>

                          <div className="min-w-0">

                            <p className="font-medium">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {product.category}
                            </p>

                          </div>

                        </div>

                        {/* STOCK */}

                        <div className="flex items-center gap-5">

                          <div className="text-right">

                            <p className="text-xs text-gray-500">
                              Current Stock
                            </p>

                            <p className="mt-1 font-semibold text-yellow-600">
                              {currentStock}
                            </p>

                          </div>

                          <Link
                            href="/admin/inventory"
                            className="border border-gray-300 px-4 py-2 text-xs font-medium transition hover:border-black"
                          >
                            Manage
                          </Link>

                        </div>

                      </div>

                    );
                  }
                )}

              </div>

            )}

          </div>

        </div>

      </div>

    </main>
  );
}