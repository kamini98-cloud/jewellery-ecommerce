"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const NOTIFICATION_KEY = "adminNotifications";

const notificationTypes = {
  orders: [
    "new-order",
    "cancelled-order",
    "confirmed-order",
    "shipped-order",
    "delivered-order",
  ],

  inventory: [
    "low-stock",
    "out-of-stock",
    "restocked",
  ],

  customers: [
    "new-customer",
  ],
};

const notificationMeta = {
  "new-order": {
    title: "New Order",
    icon: "ri-shopping-bag-line",
    className: "bg-blue-100 text-blue-600",
  },

  "cancelled-order": {
    title: "Order Cancelled",
    icon: "ri-close-circle-line",
    className: "bg-red-100 text-red-600",
  },

  "confirmed-order": {
    title: "Order Confirmed",
    icon: "ri-checkbox-circle-line",
    className: "bg-green-100 text-green-600",
  },

  "shipped-order": {
    title: "Order Shipped",
    icon: "ri-truck-line",
    className: "bg-purple-100 text-purple-600",
  },

  "delivered-order": {
    title: "Order Delivered",
    icon: "ri-checkbox-circle-fill",
    className: "bg-green-100 text-green-600",
  },

  "low-stock": {
    title: "Low Stock",
    icon: "ri-alert-line",
    className: "bg-yellow-100 text-yellow-600",
  },

  "out-of-stock": {
    title: "Out of Stock",
    icon: "ri-error-warning-line",
    className: "bg-red-100 text-red-600",
  },

  restocked: {
    title: "Product Restocked",
    icon: "ri-add-circle-line",
    className: "bg-green-100 text-green-600",
  },

  "new-customer": {
    title: "New Customer",
    icon: "ri-user-add-line",
    className: "bg-indigo-100 text-indigo-600",
  },
};

function getNotificationCategory(type) {
  if (notificationTypes.orders.includes(type)) {
    return "orders";
  }

  if (notificationTypes.inventory.includes(type)) {
    return "inventory";
  }

  if (notificationTypes.customers.includes(type)) {
    return "customers";
  }

  return null;
}

function formatDateTime(dateValue) {
  if (!dateValue) return "";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/* =========================================================
   NOTIFICATION CARD
========================================================= */

function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
  onViewOrder,
  onViewInventory,
}) {
  const meta =
    notificationMeta[notification.type] || {
      title: "Notification",
      icon: "ri-notification-3-line",
      className: "bg-gray-100 text-gray-600",
    };

  return (
    <div
      className={`rounded-xl border p-4 transition ${
        notification.isRead
          ? "border-gray-200 bg-white"
          : "border-blue-200 bg-blue-50/40"
      }`}
    >
      <div className="flex gap-4">

        {/* Notification Icon */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${meta.className}`}
        >
          <i className={`${meta.icon} text-xl`}></i>
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">

          {/* Title + Date */}
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>

              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">
                  {notification.title || meta.title}
                </h3>

                {!notification.isRead && (
                  <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    NEW
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-600">
                {notification.message}
              </p>

            </div>

            <span className="shrink-0 text-xs text-gray-400">
              {formatDateTime(notification.createdAt)}
            </span>
          </div>

          {/* Extra Information */}
          {(notification.orderId ||
            notification.productId ||
            notification.productName ||
            notification.customerName ||
            notification.amount !== undefined) && (
            <div className="mt-3 flex flex-wrap gap-2">

              {notification.orderId && (
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  Order:{" "}
                  <strong className="text-gray-800">
                    {notification.orderId}
                  </strong>
                </span>
              )}

              {notification.customerName && (
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  Customer:{" "}
                  <strong className="text-gray-800">
                    {notification.customerName}
                  </strong>
                </span>
              )}

              {notification.productName && (
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  Product:{" "}
                  <strong className="text-gray-800">
                    {notification.productName}
                  </strong>
                </span>
              )}

              {notification.amount !== undefined && (
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  Amount:{" "}
                  <strong className="text-gray-800">
                    ₹
                    {Number(
                      notification.amount || 0
                    ).toLocaleString("en-IN")}
                  </strong>
                </span>
              )}

              {notification.quantity !== undefined && (
                <span className="rounded-md bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  Stock:{" "}
                  <strong className="text-gray-800">
                    {notification.quantity}
                  </strong>
                </span>
              )}

            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-2">

            {!notification.isRead && (
              <button
                type="button"
                onClick={() => onMarkRead(notification.id)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <i className="ri-check-line mr-1"></i>
                Mark as Read
              </button>
            )}

            {notification.orderId && (
              <button
                type="button"
                onClick={() => onViewOrder(notification.orderId)}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100"
              >
                <i className="ri-eye-line mr-1"></i>
                View Order
              </button>
            )}

            {notification.productId && (
              <button
                type="button"
                onClick={() =>
                  onViewInventory(notification.productId)
                }
                className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-600 hover:bg-purple-100"
              >
                <i className="ri-box-3-line mr-1"></i>
                View Inventory
              </button>
            )}

            <button
              type="button"
              onClick={() => onDelete(notification.id)}
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
            >
              <i className="ri-delete-bin-line mr-1"></i>
              Delete
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ACCORDION SECTION
========================================================= */

function NotificationSection({
  title,
  icon,
  iconClass,
  items,
  totalCount,
  unreadCount,
  isOpen,
  onToggle,
  onMarkRead,
  onDelete,
  onViewOrder,
  onViewInventory,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-gray-50"
      >

        <div className="flex min-w-0 items-center gap-4">

          {/* Section Icon */}
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
          >
            <i className={`${icon} text-xl`}></i>
          </div>

          {/* Section Title */}
          <div className="min-w-0">

            <div className="flex flex-wrap items-center gap-2">

              <h2 className="text-base font-semibold text-gray-800">
                {title}
              </h2>

              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                  {unreadCount} unread
                </span>
              )}

            </div>

            <p className="mt-0.5 text-sm text-gray-500">
              {totalCount} notification
              {totalCount !== 1 ? "s" : ""}
            </p>

          </div>
        </div>

        {/* Right Side */}
        <div className="flex shrink-0 items-center gap-3">

          {/* Unread Number */}
          {unreadCount > 0 && (
            <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-red-100 px-2 text-xs font-semibold text-red-600">
              {unreadCount}
            </span>
          )}

          {/* Dropdown Arrow */}
         <span
  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
    isOpen
      ? "border-gray-300 bg-gray-100"
      : "border-gray-300 bg-white"
  }`}
>
  <span
    className={`block h-2.5 w-2.5 border-b-2 border-r-2 border-gray-600 transition-transform duration-200 ${
      isOpen
        ? "translate-y-0.5 rotate-[-135deg]"
        : "-translate-y-0.5 rotate-45"
    }`}
  ></span>
</span>

        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="border-t border-gray-200 bg-gray-50/50 p-4">

          {items.length > 0 ? (
            <div className="space-y-3">

              {items.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkRead={onMarkRead}
                  onDelete={onDelete}
                  onViewOrder={onViewOrder}
                  onViewInventory={onViewInventory}
                />
              ))}

            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center">

              <i className="ri-notification-off-line text-3xl text-gray-300"></i>

              <p className="mt-2 text-sm font-medium text-gray-500">
                No notifications
              </p>

              <p className="mt-1 text-xs text-gray-400">
                There are no matching notifications in this section.
              </p>

            </div>
          )}

        </div>
      )}

    </section>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function NotificationsPage() {
  const router = useRouter();

  const {
    user,
    isAuthLoaded,
  } = useAuth();

  const [notifications, setNotifications] = useState([]);

  const [readFilter, setReadFilter] = useState("all");

  /*
    Orders = open by default
    Inventory = closed
    Customers = closed
  */
  const [openSections, setOpenSections] = useState({
    orders: true,
    inventory: false,
    customers: false,
  });

  /* =====================================================
     LOAD NOTIFICATIONS
  ===================================================== */

  useEffect(() => {
    if (!isAuthLoaded) return;

    if (!user || user.role !== "admin") {
      router.replace("/admin/login");
      return;
    }

    loadNotifications();
  }, [isAuthLoaded, user, router]);

  function loadNotifications() {
    try {
      const stored = localStorage.getItem(
        NOTIFICATION_KEY
      );

      if (!stored) {
        setNotifications([]);
        return;
      }

      const parsed = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        setNotifications([]);
        return;
      }

      /*
        Remove duplicate notifications.
      */
      const uniqueNotifications = Array.from(
        new Map(
          parsed.map((notification, index) => [
            notification.id ||
              `legacy-${index}-${Date.now()}`,
            notification,
          ])
        ).values()
      );

      setNotifications(uniqueNotifications);

      localStorage.setItem(
        NOTIFICATION_KEY,
        JSON.stringify(uniqueNotifications)
      );
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );

      setNotifications([]);
    }
  }

  /* =====================================================
     SAVE
  ===================================================== */

  function saveNotifications(updatedNotifications) {
    setNotifications(updatedNotifications);

    localStorage.setItem(
      NOTIFICATION_KEY,
      JSON.stringify(updatedNotifications)
    );
  }

  /* =====================================================
     MARK READ
  ===================================================== */

  function markAsRead(id) {
    const updated = notifications.map(
      (notification) =>
        notification.id === id
          ? {
              ...notification,
              isRead: true,
            }
          : notification
    );

    saveNotifications(updated);
  }

  /* =====================================================
     MARK ALL READ
  ===================================================== */

  function markAllAsRead() {
    const updated = notifications.map(
      (notification) => ({
        ...notification,
        isRead: true,
      })
    );

    saveNotifications(updated);
  }

  /* =====================================================
     DELETE
  ===================================================== */

  function deleteNotification(id) {
    const updated = notifications.filter(
      (notification) =>
        notification.id !== id
    );

    saveNotifications(updated);
  }

  /* =====================================================
     CLEAR ALL
  ===================================================== */

  function clearAll() {
    if (notifications.length === 0) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear all notifications?"
    );

    if (!confirmed) return;

    saveNotifications([]);
  }

  /* =====================================================
     VIEW ORDER
  ===================================================== */

  function viewOrder(orderId) {
    router.push(
      `/admin/orders?search=${encodeURIComponent(
        orderId
      )}`
    );
  }

  /* =====================================================
     VIEW INVENTORY
  ===================================================== */

  function viewInventory(productId) {
    router.push(
      `/admin/inventory?productId=${encodeURIComponent(
        productId
      )}`
    );
  }

  /* =====================================================
     TOGGLE ACCORDION
  ===================================================== */

  function toggleSection(section) {
    setOpenSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  }

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredNotifications = useMemo(() => {
    return notifications.filter(
      (notification) => {
        if (readFilter === "unread") {
          return !notification.isRead;
        }

        if (readFilter === "read") {
          return notification.isRead;
        }

        return true;
      }
    );
  }, [notifications, readFilter]);

  /* =====================================================
     CATEGORY FILTERS
  ===================================================== */

  const orderNotifications = useMemo(
    () =>
      filteredNotifications.filter(
        (notification) =>
          getNotificationCategory(
            notification.type
          ) === "orders"
      ),
    [filteredNotifications]
  );

  const inventoryNotifications = useMemo(
    () =>
      filteredNotifications.filter(
        (notification) =>
          getNotificationCategory(
            notification.type
          ) === "inventory"
      ),
    [filteredNotifications]
  );

  const customerNotifications = useMemo(
    () =>
      filteredNotifications.filter(
        (notification) =>
          getNotificationCategory(
            notification.type
          ) === "customers"
      ),
    [filteredNotifications]
  );

  /* =====================================================
     TOTAL COUNTS
  ===================================================== */

  const orderTotal = notifications.filter(
    (notification) =>
      getNotificationCategory(
        notification.type
      ) === "orders"
  ).length;

  const inventoryTotal = notifications.filter(
    (notification) =>
      getNotificationCategory(
        notification.type
      ) === "inventory"
  ).length;

  const customerTotal = notifications.filter(
    (notification) =>
      getNotificationCategory(
        notification.type
      ) === "customers"
  ).length;

  /* =====================================================
     UNREAD COUNTS
  ===================================================== */

  const orderUnread = notifications.filter(
    (notification) =>
      getNotificationCategory(
        notification.type
      ) === "orders" &&
      !notification.isRead
  ).length;

  const inventoryUnread = notifications.filter(
    (notification) =>
      getNotificationCategory(
        notification.type
      ) === "inventory" &&
      !notification.isRead
  ).length;

  const customerUnread = notifications.filter(
    (notification) =>
      getNotificationCategory(
        notification.type
      ) === "customers" &&
      !notification.isRead
  ).length;

  const totalNotifications =
    notifications.length;

  const unreadCount = notifications.filter(
    (notification) =>
      !notification.isRead
  ).length;

  const readCount = notifications.filter(
    (notification) =>
      notification.isRead
  ).length;

  /* =====================================================
     AUTH LOADING
  ===================================================== */

  if (!isAuthLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading notifications...
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  /* =====================================================
     PAGE UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Notifications
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Stay updated with orders, inventory and
              customers.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <i className="ri-check-double-line mr-1"></i>
                Mark All Read
              </button>
            )}

            {totalNotifications > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
              >
                <i className="ri-delete-bin-line mr-1"></i>
                Clear All
              </button>
            )}

          </div>
        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Total */}
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Total
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-800">
              {totalNotifications}
            </p>
          </div>

          {/* Unread */}
          <div className="rounded-xl border border-red-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Unread
            </p>

            <p className="mt-1 text-2xl font-bold text-red-600">
              {unreadCount}
            </p>
          </div>

          {/* Read */}
          <div className="rounded-xl border border-green-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">
              Read
            </p>

            <p className="mt-1 text-2xl font-bold text-green-600">
              {readCount}
            </p>
          </div>

        </div>

        {/* =================================================
            READ FILTER
        ================================================= */}

        <div className="mb-6 flex flex-wrap items-center gap-2">

          <span className="mr-2 text-sm font-medium text-gray-600">
            Filter:
          </span>

          {[
            {
              value: "all",
              label: "All",
            },
            {
              value: "unread",
              label: "Unread",
            },
            {
              value: "read",
              label: "Read",
            },
          ].map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() =>
                setReadFilter(filter.value)
              }
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                readFilter === filter.value
                  ? "bg-gray-900 text-white"
                  : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter.label}
            </button>
          ))}

        </div>

        {/* =================================================
            VERTICAL ACCORDION
        ================================================= */}

        <div className="space-y-4">

          {/* ===============================================
              ORDER NOTIFICATIONS
          =============================================== */}

          <NotificationSection
            title="Order Notifications"
            icon="ri-shopping-bag-3-line"
            iconClass="bg-blue-100 text-blue-600"
            items={orderNotifications}
            totalCount={orderTotal}
            unreadCount={orderUnread}
            isOpen={openSections.orders}
            onToggle={() =>
              toggleSection("orders")
            }
            onMarkRead={markAsRead}
            onDelete={deleteNotification}
            onViewOrder={viewOrder}
            onViewInventory={viewInventory}
          />

          {/* ===============================================
              INVENTORY NOTIFICATIONS
          =============================================== */}

          <NotificationSection
            title="Inventory Notifications"
            icon="ri-box-3-line"
            iconClass="bg-purple-100 text-purple-600"
            items={inventoryNotifications}
            totalCount={inventoryTotal}
            unreadCount={inventoryUnread}
            isOpen={openSections.inventory}
            onToggle={() =>
              toggleSection("inventory")
            }
            onMarkRead={markAsRead}
            onDelete={deleteNotification}
            onViewOrder={viewOrder}
            onViewInventory={viewInventory}
          />

          {/* ===============================================
              CUSTOMER NOTIFICATIONS
          =============================================== */}

          <NotificationSection
            title="Customer Notifications"
            icon="ri-user-3-line"
            iconClass="bg-indigo-100 text-indigo-600"
            items={customerNotifications}
            totalCount={customerTotal}
            unreadCount={customerUnread}
            isOpen={openSections.customers}
            onToggle={() =>
              toggleSection("customers")
            }
            onMarkRead={markAsRead}
            onDelete={deleteNotification}
            onViewOrder={viewOrder}
            onViewInventory={viewInventory}
          />

        </div>

        {/* =================================================
            NO NOTIFICATIONS
        ================================================= */}

        {totalNotifications === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">

            <i className="ri-notification-off-line text-5xl text-gray-300"></i>

            <h3 className="mt-4 text-lg font-semibold text-gray-700">
              No Notifications
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              You are all caught up.
            </p>

          </div>
        )}

      </div>
    </div>
  );
}