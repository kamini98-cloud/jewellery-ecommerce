"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function AdminOrdersPage() {
  const router = useRouter();

  const {
    user,
    isAuthLoaded,
  } = useAuth();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [expandedOrderId, setExpandedOrderId] =
    useState(null);

  // ============================
  // ORDER STATUSES
  // ============================

  const orderStatuses = [
    "Placed",
    "Confirmed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];

  // ============================
  // FILTER ORDERS
  // IMPORTANT:
  // Hook stays BEFORE conditional return
  // ============================

  const filteredOrders = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    return orders.filter((order) => {
      const status =
        order.status || "Placed";

      const customerName =
        order.customer?.fullName || "";

      const customerEmail =
        order.customer?.email || "";

      const orderId =
        order.id?.toString() || "";

      const matchesSearch =
        !searchValue ||
        orderId
          .toLowerCase()
          .includes(searchValue) ||
        customerName
          .toLowerCase()
          .includes(searchValue) ||
        customerEmail
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    orders,
    search,
    statusFilter,
  ]);

  // ============================
  // LOAD ORDERS
  // ============================

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    if (
      !user ||
      user.role !== "admin"
    ) {
      router.replace("/admin/login");
      return;
    }

    const loadOrders = () => {
      let allOrders = [];

      // ============================
      // ADMIN ORDERS STORAGE
      // ============================

      const storedAdminOrders =
        localStorage.getItem(
          "adminOrders"
        );

      if (storedAdminOrders) {
        try {
          const parsedAdminOrders =
            JSON.parse(
              storedAdminOrders
            );

          if (
            Array.isArray(
              parsedAdminOrders
            )
          ) {
            allOrders.push(
              ...parsedAdminOrders
            );
          }
        } catch (error) {
          console.error(
            "Failed to read admin orders:",
            error
          );
        }
      }

      // ============================
      // USERS STORAGE
      // ============================

      const storedUsers =
        localStorage.getItem("users");

      if (storedUsers) {
        try {
          const parsedUsers =
            JSON.parse(storedUsers);

          if (
            Array.isArray(parsedUsers)
          ) {
            parsedUsers.forEach(
              (customer) => {
                if (
                  Array.isArray(
                    customer.orders
                  )
                ) {
                  allOrders.push(
                    ...customer.orders.map(
                      (order) => ({
                        ...order,

                        customer:
                          order.customer ||
                          {
                            fullName:
                              customer.name ||
                              "",
                            email:
                              customer.email ||
                              "",
                            phone:
                              customer.phone ||
                              "",
                          },
                      })
                    )
                  );
                }
              }
            );
          }
        } catch (error) {
          console.error(
            "Failed to read users:",
            error
          );
        }
      }

      // ============================
      // CURRENT USER STORAGE
      // ============================

      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        try {
          const parsedUser =
            JSON.parse(storedUser);

          if (
            parsedUser &&
            Array.isArray(
              parsedUser.orders
            )
          ) {
            allOrders.push(
              ...parsedUser.orders.map(
                (order) => ({
                  ...order,

                  customer:
                    order.customer ||
                    {
                      fullName:
                        parsedUser.name ||
                        "",
                      email:
                        parsedUser.email ||
                        "",
                      phone:
                        parsedUser.phone ||
                        "",
                    },
                })
              )
            );
          }
        } catch (error) {
          console.error(
            "Failed to read current user:",
            error
          );
        }
      }

      // ============================
      // REMOVE DUPLICATES
      // ============================

      const uniqueOrders =
        Array.from(
          new Map(
            allOrders.map(
              (order) => [
                order.id,
                order,
              ]
            )
          ).values()
        );

      // ============================
      // NEWEST FIRST
      // ============================

      uniqueOrders.sort(
        (a, b) =>
          new Date(
            b.orderDate || 0
          ) -
          new Date(
            a.orderDate || 0
          )
      );

      setOrders(uniqueOrders);
    };

    loadOrders();

    window.addEventListener(
      "storage",
      loadOrders
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadOrders
      );
    };
  }, [
    isAuthLoaded,
    user,
    router,
  ]);

  // ============================
  // LOADING
  // ============================

  if (!isAuthLoaded) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Loading...
        </p>
      </main>
    );
  }

  // ============================
  // NOT ADMIN
  // ============================

  if (
    !user ||
    user.role !== "admin"
  ) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <p className="text-sm text-gray-500">
          Redirecting...
        </p>
      </main>
    );
  }

  // ============================
  // PAYMENT LABEL
  // ============================

  const getPaymentLabel = (
    paymentMethod
  ) => {
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

  // ============================
  // STATUS STYLE
  // ============================

  const getStatusStyle = (
    status
  ) => {
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
  // TOGGLE DETAILS
  // ============================

  const handleToggleDetails = (
    orderId
  ) => {
    setExpandedOrderId(
      (current) =>
        current === orderId
          ? null
          : orderId
    );
  };

  // ============================
  // UPDATE ORDER STATUS
  // ============================

  const handleStatusChange = (
    orderId,
    newStatus
  ) => {
    const updatedOrders =
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: newStatus,
              ...(newStatus !==
                "Cancelled" && {
                cancelledAt: undefined,
              }),
            }
          : order
      );

    setOrders(updatedOrders);

    // ============================
    // SAVE ADMIN ORDERS
    // ============================

    localStorage.setItem(
      "adminOrders",
      JSON.stringify(
        updatedOrders
      )
    );

    // ============================
    // UPDATE USERS
    // ============================

    const storedUsers =
      localStorage.getItem("users");

    if (storedUsers) {
      try {
        const parsedUsers =
          JSON.parse(storedUsers);

        if (
          Array.isArray(parsedUsers)
        ) {
          const updatedUsers =
            parsedUsers.map(
              (customer) => ({
                ...customer,

                orders:
                  Array.isArray(
                    customer.orders
                  )
                    ? customer.orders.map(
                        (order) =>
                          order.id ===
                          orderId
                            ? {
                                ...order,
                                status:
                                  newStatus,
                              }
                            : order
                      )
                    : customer.orders,
              })
            );

          localStorage.setItem(
            "users",
            JSON.stringify(
              updatedUsers
            )
          );
        }
      } catch (error) {
        console.error(
          "Failed to update users:",
          error
        );
      }
    }

    // ============================
    // UPDATE CURRENT USER
    // ============================

    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser =
          JSON.parse(storedUser);

        if (
          parsedUser &&
          Array.isArray(
            parsedUser.orders
          )
        ) {
          const updatedUser = {
            ...parsedUser,

            orders:
              parsedUser.orders.map(
                (order) =>
                  order.id === orderId
                    ? {
                        ...order,
                        status:
                          newStatus,
                      }
                    : order
              ),
          };

          localStorage.setItem(
            "user",
            JSON.stringify(
              updatedUser
            )
          );
        }
      } catch (error) {
        console.error(
          "Failed to update current user:",
          error
        );
      }
    }

    // ============================
    // NOTIFY OTHER TABS
    // ============================

    window.dispatchEvent(
      new Event("storage")
    );
  };

  // ============================
  // CANCEL ORDER
  // ============================

  const handleCancelOrder = (
    orderId
  ) => {
    const order =
      orders.find(
        (item) =>
          item.id === orderId
      );

    if (!order) {
      return;
    }

    if (
      order.status !== "Placed" &&
      order.status !== "Confirmed"
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        "Are you sure you want to cancel this order?"
      );

    if (!confirmed) {
      return;
    }

    const cancelledAt =
      new Date().toISOString();

    const updatedOrders =
      orders.map((item) =>
        item.id === orderId
          ? {
              ...item,
              status: "Cancelled",
              cancelledAt,
            }
          : item
      );

    setOrders(updatedOrders);

    // Save admin orders

    localStorage.setItem(
      "adminOrders",
      JSON.stringify(
        updatedOrders
      )
    );

    // Update users

    const storedUsers =
      localStorage.getItem("users");

    if (storedUsers) {
      try {
        const parsedUsers =
          JSON.parse(storedUsers);

        if (
          Array.isArray(parsedUsers)
        ) {
          const updatedUsers =
            parsedUsers.map(
              (customer) => ({
                ...customer,

                orders:
                  Array.isArray(
                    customer.orders
                  )
                    ? customer.orders.map(
                        (order) =>
                          order.id ===
                          orderId
                            ? {
                                ...order,
                                status:
                                  "Cancelled",
                                cancelledAt,
                              }
                            : order
                      )
                    : customer.orders,
              })
            );

          localStorage.setItem(
            "users",
            JSON.stringify(
              updatedUsers
            )
          );
        }
      } catch (error) {
        console.error(
          "Failed to cancel order:",
          error
        );
      }
    }

    // Update current user

    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser =
          JSON.parse(storedUser);

        if (
          parsedUser &&
          Array.isArray(
            parsedUser.orders
          )
        ) {
          const updatedUser = {
            ...parsedUser,

            orders:
              parsedUser.orders.map(
                (order) =>
                  order.id === orderId
                    ? {
                        ...order,
                        status:
                          "Cancelled",
                        cancelledAt,
                      }
                    : order
              ),
          };

          localStorage.setItem(
            "user",
            JSON.stringify(
              updatedUser
            )
          );
        }
      } catch (error) {
        console.error(
          "Failed to cancel current user order:",
          error
        );
      }
    }

    window.dispatchEvent(
      new Event("storage")
    );
  };

  // ============================
  // DATE
  // ============================

 const formatDate = (date) => {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

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

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="mb-8">

          <button
            type="button"
            onClick={() =>
              router.push("/admin")
            }
            className="mb-4 text-sm underline"
          >
            ← Back to Dashboard
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Admin Panel
              </p>

              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
                Orders Management
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                View and manage customer orders.
              </p>

            </div>

            <div className="border border-gray-200 bg-white px-5 py-3">

              <p className="text-xs uppercase tracking-wide text-gray-500">
                Total Orders
              </p>

              <p className="mt-1 text-2xl font-semibold">
                {orders.length}
              </p>

            </div>

          </div>

        </div>

        {/* ================= FILTERS ================= */}

        <div className="border border-gray-200 bg-white p-5">

          <div className="grid gap-5 md:grid-cols-2">

            <div>

              <label className="mb-2 block text-xs font-medium">
                Search Orders
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search order ID, customer name or email..."
                className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />

            </div>

            <div>

              <label className="mb-2 block text-xs font-medium">
                Order Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              >

                <option value="All">
                  All Statuses
                </option>

                {orderStatuses.map(
                  (status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

        </div>

        {/* ================= COUNT ================= */}

        <p className="mt-5 text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium text-black">
            {filteredOrders.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-black">
            {orders.length}
          </span>{" "}
          orders
        </p>

        {/* ================= NO ORDERS ================= */}

        {filteredOrders.length ===
        0 ? (

          <div className="mt-4 border border-gray-200 bg-white px-6 py-16 text-center">

            <div className="text-5xl">
              📦
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              {orders.length === 0
                ? "No customer orders"
                : "No matching orders"}
            </h2>

            <p className="mt-2 text-sm text-gray-500">

              {orders.length === 0
                ? "Customer orders will appear here after an order is placed."
                : "Try changing your search or status filter."}

            </p>

          </div>

        ) : (

          /* ================= ORDER LIST ================= */

          <div className="mt-4 space-y-4">

            {filteredOrders.map(
              (order) => {

                const isExpanded =
                  expandedOrderId ===
                  order.id;

                const status =
                  order.status ||
                  "Placed";

                const customerName =
                  order.customer
                    ?.fullName ||
                  "Guest Customer";

                return (

                  <div
                    key={order.id}
                    className="border border-gray-200 bg-white"
                  >

                    {/* ================= SUMMARY ================= */}

                    <div className="p-5 sm:p-6">

                      <div className="grid gap-5 lg:grid-cols-[1fr_auto]">

                        {/* LEFT */}

                        <div className="grid gap-5 sm:grid-cols-3">

                          <div>

                            <p className="text-xs uppercase tracking-wide text-gray-500">
                              Order ID
                            </p>

                            <p className="mt-1 font-medium">
                              {order.id}
                            </p>

                          </div>

                          <div>

                            <p className="text-xs uppercase tracking-wide text-gray-500">
                              Customer
                            </p>

                            <p className="mt-1 font-medium">
                              {customerName}
                            </p>

                            {order.customer
                              ?.email && (

                              <p className="mt-1 break-all text-xs text-gray-500">
                                {
                                  order.customer
                                    .email
                                }
                              </p>

                            )}

                          </div>

                          <div>

                            <p className="text-xs uppercase tracking-wide text-gray-500">
                              Date
                            </p>

                            <p className="mt-1 text-sm">
                              {formatDate(
                                order.orderDate
                              )}
                            </p>

                          </div>

                        </div>

                        {/* RIGHT */}

                        <div className="lg:text-right">

                          <p className="text-xs uppercase tracking-wide text-gray-500">
                            Total
                          </p>

                          <p className="mt-1 text-xl font-semibold">
                            ₹
                            {Number(
                              order.total ||
                                0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                        </div>

                      </div>

                      {/* STATUS + ACTIONS */}

                      <div className="mt-6 flex flex-col gap-4 border-t pt-5 lg:flex-row lg:items-center lg:justify-between">

                        <div className="flex flex-wrap items-center gap-3">

                          <span
                            className={`border px-3 py-1 text-xs font-medium ${getStatusStyle(
                              status
                            )}`}
                          >
                            {status}
                          </span>

                          <span className="text-xs text-gray-500">
                            Payment:{" "}
                            {getPaymentLabel(
                              order.paymentMethod
                            )}
                          </span>

                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleDetails(
                                order.id
                              )
                            }
                            className="border border-black px-5 py-2.5 text-sm font-medium transition hover:bg-black hover:text-white"
                          >
                            {isExpanded
                              ? "Hide Details"
                              : "View Details"}
                          </button>

                          <select
                            value={status}
                            onChange={(
                              event
                            ) =>
                              handleStatusChange(
                                order.id,
                                event.target.value
                              )
                            }
                            className="border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-black"
                          >

                            {orderStatuses.map(
                              (
                                orderStatus
                              ) => (
                                <option
                                  key={
                                    orderStatus
                                  }
                                  value={
                                    orderStatus
                                  }
                                >
                                  {orderStatus}
                                </option>
                              )
                            )}

                          </select>

                          {(status ===
                            "Placed" ||
                            status ===
                              "Confirmed") && (

                            <button
                              type="button"
                              onClick={() =>
                                handleCancelOrder(
                                  order.id
                                )
                              }
                              className="border border-red-600 px-5 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white"
                            >
                              Cancel
                            </button>

                          )}

                        </div>

                      </div>

                    </div>

                    {/* ================= DETAILS ================= */}

                    {isExpanded && (

                      <div className="border-t bg-gray-50 p-5 sm:p-6">

                        <div className="grid gap-8 lg:grid-cols-2">

                          {/* CUSTOMER */}

                          <section>

                            <h3 className="font-semibold">
                              Customer Information
                            </h3>

                            <div className="mt-4 space-y-3 text-sm">

                              <div>

                                <p className="text-xs text-gray-500">
                                  Name
                                </p>

                                <p className="mt-1 font-medium">
                                  {order.customer
                                    ?.fullName ||
                                    "—"}
                                </p>

                              </div>

                              <div>

                                <p className="text-xs text-gray-500">
                                  Email
                                </p>

                                <p className="mt-1 break-all font-medium">
                                  {order.customer
                                    ?.email ||
                                    "—"}
                                </p>

                              </div>

                              <div>

                                <p className="text-xs text-gray-500">
                                  Phone
                                </p>

                                <p className="mt-1 font-medium">
                                  {order.customer
                                    ?.phone
                                    ? `+91 ${order.customer.phone}`
                                    : "—"}
                                </p>

                              </div>

                            </div>

                          </section>

                          {/* ADDRESS */}

                          <section>

                            <h3 className="font-semibold">
                              Delivery Address
                            </h3>

                            <div className="mt-4 border border-gray-200 bg-white p-4 text-sm leading-6">

                              <p className="font-medium">
                                {order.address
                                  ?.fullName ||
                                  "—"}
                              </p>

                              {order.address
                                ?.mobile && (

                                <p>
                                  +91{" "}
                                  {
                                    order.address
                                      .mobile
                                  }
                                </p>

                              )}

                              {order.address
                                ?.address && (

                                <p className="mt-2">
                                  {
                                    order.address
                                      .address
                                  }
                                </p>

                              )}

                              {order.address
                                ?.locality && (

                                <p>
                                  {
                                    order.address
                                      .locality
                                  }
                                </p>

                              )}

                              <p>

                                {order.address
                                  ?.city ||
                                  "—"}

                                {order.address
                                  ?.state
                                  ? `, ${order.address.state}`
                                  : ""}

                                {order.address
                                  ?.pincode
                                  ? ` - ${order.address.pincode}`
                                  : ""}

                              </p>

                            </div>

                          </section>

                        </div>

                        {/* PRODUCTS */}

                        <section className="mt-8">

                          <h3 className="font-semibold">
                            Ordered Products
                          </h3>

                          <div className="mt-4 divide-y border border-gray-200 bg-white">

                            {(order.items ||
                              []).map(
                              (
                                item,
                                index
                              ) => (

                                <div
                                  key={`${order.id}-${item.id}-${index}`}
                                  className="flex gap-4 p-4"
                                >

                                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden bg-gray-100">

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

                                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                                        No Image
                                      </div>

                                    )}

                                  </div>

                                  <div className="min-w-0 flex-1">

                                    <p className="font-medium">
                                      {item.name}
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                      Qty:{" "}
                                      {
                                        item.quantity
                                      }
                                    </p>

                                  </div>

                                  <p className="font-medium">

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

                              )
                            )}

                          </div>

                        </section>

                        {/* PAYMENT */}

                        <section className="mt-8">

                          <h3 className="font-semibold">
                            Payment Summary
                          </h3>

                          <div className="mt-4 max-w-md border border-gray-200 bg-white p-4 text-sm">

                            <div className="flex justify-between">

                              <span className="text-gray-500">
                                Payment Method
                              </span>

                              <span className="font-medium">
                                {getPaymentLabel(
                                  order.paymentMethod
                                )}
                              </span>

                            </div>

                            <div className="mt-3 flex justify-between">

                              <span className="text-gray-500">
                                Items
                              </span>

                              <span>
                                {order.totalItems ||
                                  0}
                              </span>

                            </div>

                            {order.subtotal !==
                              undefined && (

                              <div className="mt-3 flex justify-between">

                                <span className="text-gray-500">
                                  Subtotal
                                </span>

                                <span>
                                  ₹
                                  {Number(
                                    order.subtotal ||
                                      0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </span>

                              </div>

                            )}

                            {order.discount >
                              0 && (

                              <div className="mt-3 flex justify-between text-green-600">

                                <span>
                                  Discount
                                </span>

                                <span>
                                  -₹
                                  {Number(
                                    order.discount ||
                                      0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}
                                </span>

                              </div>

                            )}

                            <div className="my-4 border-t" />

                            <div className="flex justify-between font-semibold">

                              <span>
                                Total
                              </span>

                              <span>
                                ₹
                                {Number(
                                  order.total ||
                                    0
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
              }
            )}

          </div>

        )}

      </div>

    </main>
  );
}