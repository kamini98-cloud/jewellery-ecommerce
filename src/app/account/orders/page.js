"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function OrdersPage() {
  const router = useRouter();

  const { user, isAuthLoaded, updateUser } = useAuth();

  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // ================= LOADING =================

  if (!isAuthLoaded) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading...
        </p>
      </main>
    );
  }

  // ================= NOT LOGGED IN =================

  if (!user) {
    router.replace("/login");

    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading...
        </p>
      </main>
    );
  }

  const orders = Array.isArray(user.orders)
    ? user.orders
    : [];

  // ================= TOGGLE DETAILS =================

  const handleToggleDetails = (orderId) => {
    setExpandedOrderId((current) =>
      current === orderId ? null : orderId
    );
  };

  // ================= PAYMENT LABEL =================

  const getPaymentLabel = (paymentMethod) => {
    if (paymentMethod === "cod") {
      return "Cash on Delivery";
    }

    if (paymentMethod === "upi") {
      return "UPI";
    }

    if (paymentMethod === "card") {
      return "Credit / Debit Card";
    }

    return paymentMethod || "—";
  };

  // ================= ORDER STATUS =================

  const orderStatuses = [
    "Placed",
    "Confirmed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  // ================= GET STATUS INDEX =================

  const getStatusIndex = (status) => {
    const index = orderStatuses.indexOf(status);

    return index >= 0 ? index : 0;
  };

  // ================= CAN CANCEL =================

  const canCancelOrder = (status) => {
    return (
      status === "Placed" ||
      status === "Confirmed"
    );
  };

  // ================= CANCEL ORDER =================

  const handleCancelOrder = (orderId) => {
    const order = orders.find(
      (item) => item.id === orderId
    );

    if (!order) {
      return;
    }

    if (!canCancelOrder(order.status || "Placed")) {
      return;
    }

    // Prevent inventory from being restored twice
    if (order.inventoryRestored) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    // ==================================================
    // RESTORE INVENTORY
    // ==================================================

    const inventoryStored =
      localStorage.getItem("adminInventory");

    let inventory = {};

    if (inventoryStored) {
      try {
        const parsedInventory =
          JSON.parse(inventoryStored);

        if (
          parsedInventory &&
          typeof parsedInventory === "object" &&
          !Array.isArray(parsedInventory)
        ) {
          inventory = parsedInventory;
        }
      } catch (error) {
        console.error(
          "Failed to read admin inventory:",
          error
        );
      }
    }

    const updatedInventory = {
      ...inventory,
    };

    const restockedProducts = [];

    // Restore every product from the order
    (order.items || []).forEach((item) => {
      const productId = String(item.id);

      const quantity = Number(
        item.quantity || 0
      );

      if (quantity <= 0) {
        return;
      }

      const currentStock = Number(
        updatedInventory[productId] || 0
      );

      const newStock =
        currentStock + quantity;

      updatedInventory[productId] = newStock;

      restockedProducts.push({
        productId,
        productName:
          item.name || "Product",
        quantity,
        newStock,
      });
    });

    // Save restored inventory
    localStorage.setItem(
      "adminInventory",
      JSON.stringify(updatedInventory)
    );

    // ==================================================
    // CREATE RESTOCK NOTIFICATIONS
    // ==================================================

    const existingNotificationsStored =
      localStorage.getItem(
        "adminNotifications"
      );

    let notifications = [];

    if (existingNotificationsStored) {
      try {
        const parsedNotifications =
          JSON.parse(
            existingNotificationsStored
          );

        if (Array.isArray(parsedNotifications)) {
          notifications =
            parsedNotifications;
        }
      } catch (error) {
        console.error(
          "Failed to read notifications:",
          error
        );
      }
    }

    restockedProducts.forEach(
      (product) => {
        const notificationId =
          typeof crypto !== "undefined" &&
          crypto.randomUUID
            ? `NOTIF-${crypto.randomUUID()}`
            : `NOTIF-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`;

        notifications.unshift({
          id: notificationId,
          type: "restocked",
          category: "inventory",
          title: "Product Restocked",
          message: `${
            product.productName
          } stock restored by ${
            product.quantity
          } item${
            product.quantity > 1
              ? "s"
              : ""
          } after order cancellation.`,
          productId:
            product.productId,
          productName:
            product.productName,
          quantity:
            product.quantity,
          orderId: order.id,
          createdAt:
            new Date().toISOString(),
          isRead: false,
        });
      }
    );

    localStorage.setItem(
      "adminNotifications",
      JSON.stringify(notifications)
    );

    // ==================================================
    // UPDATE CUSTOMER ORDER
    // ==================================================

    const cancellationTime =
      new Date().toISOString();

    const updatedOrders = orders.map(
      (item) =>
        item.id === orderId
          ? {
              ...item,
              status: "Cancelled",
              cancelledAt:
                cancellationTime,
              inventoryRestored: true,
            }
          : item
    );

    const updatedUser = {
      ...user,
      orders: updatedOrders,
    };

    // Save immediately
    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

    // ==================================================
    // UPDATE ADMIN ORDERS
    // ==================================================

    const adminOrdersStored =
      localStorage.getItem("adminOrders");

    if (adminOrdersStored) {
      try {
        const adminOrders =
          JSON.parse(adminOrdersStored);

        if (Array.isArray(adminOrders)) {
          const updatedAdminOrders =
            adminOrders.map((item) =>
              item.id === orderId
                ? {
                    ...item,
                    status: "Cancelled",
                    cancelledAt:
                      cancellationTime,
                    inventoryRestored: true,
                  }
                : item
            );

          localStorage.setItem(
            "adminOrders",
            JSON.stringify(
              updatedAdminOrders
            )
          );
        }
      } catch (error) {
        console.error(
          "Failed to update admin orders:",
          error
        );
      }
    }

    // ==================================================
    // UPDATE AUTH CONTEXT
    // ==================================================

    updateUser({
      orders: updatedOrders,
    });
  };

  return (
    <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

      {/* ================= HEADER ================= */}

      <div className="mb-10">

        <button
          type="button"
          onClick={() =>
            router.push("/account")
          }
          className="mb-5 text-sm underline"
        >
          ← Back to Account
        </button>

        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          Order History
        </p>

        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
          My Orders
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          View your previous orders and order details.
        </p>

      </div>

      {/* ================= NO ORDERS ================= */}

      {orders.length === 0 ? (

        <div className="border border-gray-200 px-6 py-16 text-center">

          <div className="text-5xl">
            📦
          </div>

          <h2 className="mt-5 text-xl font-semibold">
            No orders yet
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Your order history will appear here after you place an order.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/shop")
            }
            className="mt-6 bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Start Shopping
          </button>

        </div>

      ) : (

        /* ================= ORDER LIST ================= */

        <div className="space-y-5">

          {orders.map((order) => {

            const isExpanded =
              expandedOrderId === order.id;

            const currentStatusIndex =
              getStatusIndex(
                order.status || "Placed"
              );

            const isCancelled =
              order.status === "Cancelled";

            return (

              <div
                key={order.id}
                className="border border-gray-200 p-5 sm:p-6"
              >

                {/* ================= ORDER HEADER ================= */}

                <div className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Order ID
                    </p>

                    <p className="mt-1 font-medium">
                      {order.id}
                    </p>

                  </div>

                  <div className="sm:text-right">

                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Order Date & Time
                    </p>

                    <p className="mt-1 text-sm">
                      {order.orderDate
                        ? new Date(
                            order.orderDate
                          ).toLocaleString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )
                        : "—"}
                    </p>

                  </div>

                </div>

                {/* ================= ORDER STATUS + TOTAL ================= */}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                  <div>

                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Status
                    </p>

                    <span
                      className={`mt-2 inline-block border px-3 py-1 text-xs font-medium ${
                        isCancelled
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-green-200 bg-green-50 text-green-700"
                      }`}
                    >
                      {order.status ||
                        "Placed"}
                    </span>

                  </div>

                  <div className="text-right">

                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      Total
                    </p>

                    <p className="mt-1 text-lg font-semibold">
                      ₹
                      {Number(
                        order.total || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>

                  </div>

                </div>

                {/* ================= ORDER ITEMS PREVIEW ================= */}

                <div className="mt-5 border-t pt-5">

                  <p className="mb-4 text-sm font-medium">
                    Items
                  </p>

                  <div className="space-y-3">

                    {(order.items || []).map(
                      (item, index) => (

                        <div
                          key={`${order.id}-${item.id}-${index}`}
                          className="flex items-center justify-between gap-4 text-sm"
                        >

                          <div className="min-w-0">

                            <p className="font-medium">
                              {item.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Qty:{" "}
                              {item.quantity}
                            </p>

                          </div>

                          <p className="flex-shrink-0">
                            ₹
                            {(
                              Number(
                                item.price || 0
                              ) *
                              Number(
                                item.quantity ||
                                  0
                              )
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                        </div>

                      )
                    )}

                  </div>

                </div>

                {/* ================= PAYMENT + ITEMS ================= */}

                <div className="mt-5 flex flex-col gap-2 border-t pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-gray-500">

                    Payment:{" "}

                    <span className="font-medium text-black">
                      {getPaymentLabel(
                        order.paymentMethod
                      )}
                    </span>

                  </p>

                  <p className="text-gray-500">

                    Items:{" "}

                    <span className="font-medium text-black">
                      {order.totalItems || 0}
                    </span>

                  </p>

                </div>

                {/* ================= VIEW DETAILS ================= */}

                <div className="mt-5 flex flex-col gap-3 border-t pt-5 sm:flex-row">

                  <button
                    type="button"
                    onClick={() =>
                      handleToggleDetails(
                        order.id
                      )
                    }
                    className="flex-1 border border-black px-5 py-3 text-sm font-medium transition hover:bg-black hover:text-white"
                  >
                    {isExpanded
                      ? "Hide Details"
                      : "View Details"}
                  </button>

                  {/* ================= CANCEL ORDER ================= */}

                  {canCancelOrder(
                    order.status || "Placed"
                  ) && (

                    <button
                      type="button"
                      onClick={() =>
                        handleCancelOrder(
                          order.id
                        )
                      }
                      className="flex-1 border border-red-600 px-5 py-3 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
                    >
                      Cancel Order
                    </button>

                  )}

                </div>

                {/* ================= FULL ORDER DETAILS ================= */}

                {isExpanded && (

                  <div className="mt-6 space-y-8 border-t pt-6">

                    {/* ================= ORDER TRACKING ================= */}

                    <section>

                      <h3 className="text-base font-semibold">
                        Order Tracking
                      </h3>

                      {isCancelled ? (

                        <div className="mt-5 border border-red-200 bg-red-50 p-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-8 w-8 items-center justify-center border border-red-300 bg-white text-sm font-semibold text-red-600">
                              ✕
                            </div>

                            <div>

                              <p className="text-sm font-semibold text-red-700">
                                Order Cancelled
                              </p>

                              <p className="mt-1 text-xs text-red-600">
                                This order has been cancelled.
                              </p>

                            </div>

                          </div>

                          {order.cancelledAt && (
                            <p className="mt-4 text-xs text-red-600">
                              Cancelled on{" "}
                              {new Date(
                                order.cancelledAt
                              ).toLocaleString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )}
                            </p>
                          )}

                        </div>

                      ) : (

                        <div className="mt-6">

                          <div className="relative">

                            {/* VERTICAL LINE */}

                            <div className="absolute left-[15px] top-3 h-[calc(100%-24px)] w-px bg-gray-200" />

                            <div className="space-y-7">

                              {orderStatuses.map(
                                (
                                  status,
                                  index
                                ) => {

                                  const isCompleted =
                                    index <=
                                    currentStatusIndex;

                                  const isCurrent =
                                    index ===
                                    currentStatusIndex;

                                  return (

                                    <div
                                      key={status}
                                      className="relative flex gap-4"
                                    >

                                      {/* STATUS CIRCLE */}

                                      <div
                                        className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center border text-xs font-semibold ${
                                          isCompleted
                                            ? "border-black bg-black text-white"
                                            : "border-gray-300 bg-white text-gray-400"
                                        }`}
                                      >
                                        {isCompleted
                                          ? "✓"
                                          : index + 1}
                                      </div>

                                      {/* STATUS TEXT */}

                                      <div className="pt-1">

                                        <p
                                          className={`text-sm font-medium ${
                                            isCurrent
                                              ? "text-black"
                                              : isCompleted
                                              ? "text-gray-700"
                                              : "text-gray-400"
                                          }`}
                                        >
                                          {status}
                                        </p>

                                        {isCurrent && (
                                          <p className="mt-1 text-xs text-gray-500">
                                            Your order is currently{" "}
                                            {status.toLowerCase()}.
                                          </p>
                                        )}

                                      </div>

                                    </div>

                                  );
                                }
                              )}

                            </div>

                          </div>

                        </div>

                      )}

                    </section>

                    {/* ================= CUSTOMER ================= */}

                    <section>

                      <h3 className="text-base font-semibold">
                        Customer Information
                      </h3>

                      <div className="mt-4 grid gap-4 sm:grid-cols-3">

                        <div>

                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Name
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {order.customer?.fullName ||
                              "—"}
                          </p>

                        </div>

                        <div>

                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Email
                          </p>

                          <p className="mt-1 break-all text-sm font-medium">
                            {order.customer?.email ||
                              "—"}
                          </p>

                        </div>

                        <div>

                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Phone
                          </p>

                          <p className="mt-1 text-sm font-medium">
                            {order.customer?.phone
                              ? `+91 ${order.customer.phone}`
                              : "—"}
                          </p>

                        </div>

                      </div>

                    </section>

                    {/* ================= DELIVERY ADDRESS ================= */}

                    <section>

                      <h3 className="text-base font-semibold">
                        Delivery Address
                      </h3>

                      <div className="mt-4 border border-gray-200 p-4">

                        <p className="text-sm font-medium">
                          {order.address?.fullName ||
                            "—"}
                        </p>

                        {order.address?.mobile && (
                          <p className="mt-1 text-sm text-gray-600">
                            +91{" "}
                            {order.address.mobile}
                          </p>
                        )}

                        <div className="mt-3 text-sm leading-6 text-gray-600">

                          {order.address?.address && (
                            <p>
                              {order.address.address}
                            </p>
                          )}

                          {order.address?.locality && (
                            <p>
                              {order.address.locality}
                            </p>
                          )}

                          <p>
                            {order.address?.city ||
                              "—"}
                            {order.address?.state
                              ? `, ${order.address.state}`
                              : ""}
                            {order.address?.pincode
                              ? ` - ${order.address.pincode}`
                              : ""}
                          </p>

                        </div>

                      </div>

                    </section>

                    {/* ================= ORDERED PRODUCTS ================= */}

                    <section>

                      <h3 className="text-base font-semibold">
                        Ordered Products
                      </h3>

                      <div className="mt-4 divide-y border border-gray-200">

                        {(order.items || []).map(
                          (item, index) => (

                            <div
                              key={`${order.id}-detail-${item.id}-${index}`}
                              className="flex gap-4 p-4"
                            >

                              {/* PRODUCT IMAGE */}

                              <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden bg-gray-100">

                                {item.image ? (

                                  <img
                                    src={
                                      item.image
                                    }
                                    alt={
                                      item.name ||
                                      "Product"
                                    }
                                    className="h-full w-full object-cover"
                                  />

                                ) : (

                                  <span className="text-xs text-gray-400">
                                    No Image
                                  </span>

                                )}

                              </div>

                              {/* PRODUCT INFO */}

                              <div className="min-w-0 flex-1">

                                <p className="font-medium">
                                  {item.name}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                  Quantity:{" "}
                                  {item.quantity ||
                                    0}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                  Price: ₹
                                  {Number(
                                    item.price || 0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </p>

                              </div>

                              {/* ITEM TOTAL */}

                              <div className="text-right">

                                <p className="text-xs text-gray-500">
                                  Total
                                </p>

                                <p className="mt-1 font-semibold">
                                  ₹
                                  {(
                                    Number(
                                      item.price ||
                                        0
                                    ) *
                                    Number(
                                      item.quantity ||
                                        0
                                    )
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </p>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    </section>

                    {/* ================= PAYMENT SUMMARY ================= */}

                    <section>

                      <h3 className="text-base font-semibold">
                        Payment Summary
                      </h3>

                      <div className="mt-4 border border-gray-200 p-4">

                        <div className="flex justify-between text-sm">

                          <span className="text-gray-500">
                            Payment Method
                          </span>

                          <span className="font-medium">
                            {getPaymentLabel(
                              order.paymentMethod
                            )}
                          </span>

                        </div>

                        <div className="mt-4 flex justify-between text-sm">

                          <span className="text-gray-500">
                            Total Items
                          </span>

                          <span className="font-medium">
                            {order.totalItems ||
                              0}
                          </span>

                        </div>

                        <div className="my-4 border-t" />

                        <div className="flex justify-between">

                          <span className="font-semibold">
                            Total
                          </span>

                          <span className="text-lg font-semibold">
                            ₹
                            {Number(
                              order.total || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </span>

                        </div>

                      </div>

                    </section>

                  </div>

                )}

              </div>
            );
          })}

        </div>

      )}

    </main>
  );
}