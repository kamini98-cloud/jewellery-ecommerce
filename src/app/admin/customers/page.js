"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function AdminCustomersPage() {
  const router = useRouter();

  const {
    user,
    isAdmin,
    isAuthLoaded,
  } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

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
  // LOAD CUSTOMERS
  // ============================

  const loadCustomers = () => {
    try {
      const storedUsers =
        localStorage.getItem("users");

      const storedCurrentUser =
        localStorage.getItem("user");

      let users = [];

      // ============================
      // LOAD USERS ARRAY
      // ============================

      if (storedUsers) {
        try {
          const parsedUsers =
            JSON.parse(storedUsers);

          if (Array.isArray(parsedUsers)) {
            users = parsedUsers;
          }
        } catch (error) {
          console.error(
            "Failed to parse users:",
            error
          );
        }
      }

      // ============================
      // INCLUDE CURRENT USER
      // ============================

      if (storedCurrentUser) {
        try {
          const currentUser =
            JSON.parse(storedCurrentUser);

          if (
            currentUser &&
            currentUser.role !== "admin"
          ) {
            const alreadyExists =
              users.some(
                (item) =>
                  item.id === currentUser.id
              );

            if (!alreadyExists) {
              users.push(currentUser);
            }
          }
        } catch (error) {
          console.error(
            "Failed to parse current user:",
            error
          );
        }
      }

      // ============================
      // LOAD ADMIN ORDERS
      // ============================

      const storedAdminOrders =
        localStorage.getItem("adminOrders");

      let adminOrders = [];

      if (storedAdminOrders) {
        try {
          const parsedOrders =
            JSON.parse(storedAdminOrders);

          if (Array.isArray(parsedOrders)) {
            adminOrders = parsedOrders;
          }
        } catch (error) {
          console.error(
            "Failed to parse admin orders:",
            error
          );
        }
      }

      // ============================
      // CREATE CUSTOMER DATA
      // ============================

      const customerMap = {};

      // First add users
      users.forEach((item) => {
        if (!item || item.role === "admin") {
          return;
        }

        const customerId =
          item.id ||
          item.mobile ||
          item.email;

        if (!customerId) {
          return;
        }

        customerMap[customerId] = {
          id: customerId,
          name:
            item.name ||
            item.fullName ||
            "Customer",
          email: item.email || "",
          mobile:
            item.mobile ||
            item.phone ||
            "",
          orders: Array.isArray(item.orders)
            ? item.orders
            : [],
        };
      });

      // ============================
      // ADD CUSTOMERS FROM ORDERS
      // ============================

      adminOrders.forEach((order) => {
        const customer =
          order.customer || {};

        const customerId =
          customer.email ||
          customer.phone ||
          customer.fullName;

        if (!customerId) {
          return;
        }

        if (!customerMap[customerId]) {
          customerMap[customerId] = {
            id: customerId,
            name:
              customer.fullName ||
              "Customer",
            email:
              customer.email ||
              "",
            mobile:
              customer.phone ||
              "",
            orders: [],
          };
        }

        const existingOrder =
          customerMap[
            customerId
          ].orders.some(
            (item) =>
              item.id === order.id
          );

        if (!existingOrder) {
          customerMap[
            customerId
          ].orders.push(order);
        }
      });

      setCustomers(
        Object.values(customerMap)
      );
    } catch (error) {
      console.error(
        "Failed to load customers:",
        error
      );

      setCustomers([]);
    }
  };

  // ============================
  // INITIAL LOAD
  // ============================

  useEffect(() => {
    if (!isAuthLoaded || !isAdmin) {
      return;
    }

    loadCustomers();

    const handleStorageChange = () => {
      loadCustomers();
    };

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, [
    isAuthLoaded,
    isAdmin,
  ]);

  // ============================
  // FILTER CUSTOMERS
  // ============================

  const filteredCustomers = useMemo(() => {
    const value =
      search.trim().toLowerCase();

    if (!value) {
      return customers;
    }

    return customers.filter(
      (customer) =>
        customer.name
          .toLowerCase()
          .includes(value) ||
        customer.email
          .toLowerCase()
          .includes(value) ||
        customer.mobile
          .toLowerCase()
          .includes(value)
    );
  }, [
    customers,
    search,
  ]);

  // ============================
  // CUSTOMER STATS
  // ============================

  const totalCustomers =
    customers.length;

  const totalOrders =
    customers.reduce(
      (total, customer) =>
        total +
        customer.orders.length,
      0
    );

  const totalRevenue =
    customers.reduce(
      (total, customer) =>
        total +
        customer.orders.reduce(
          (orderTotal, order) => {
            if (
              order.status ===
              "Cancelled"
            ) {
              return orderTotal;
            }

            return (
              orderTotal +
              Number(order.total || 0)
            );
          },
          0
        ),
      0
    );

  // ============================
  // CUSTOMER DETAILS
  // ============================

  const getCustomerOrderTotal = (
    customer
  ) => {
    return customer.orders.reduce(
      (total, order) => {
        if (
          order.status ===
          "Cancelled"
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
  };

  // ============================
  // FORMAT DATE + TIME
  // ============================

  const formatDate = (date) => {
    if (!date) {
      return "Date unavailable";
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "Date unavailable";
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Loading customers...
        </p>
      </div>
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
    <div className="min-h-screen bg-gray-50">

      {/* ================= HEADER ================= */}

      <div className="border-b bg-white">

        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

               <Link
              href="/admin"
              className="text-sm text-gray-500 hover:text-black"
            >
              ← Back to Dashboard
            </Link>

              <h1 className="mt-1 text-2xl font-semibold">
                Customers
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage and view your customers.
              </p>

            </div>

            {/* <button
              type="button"
              onClick={() =>
                router.push("/admin")
              }
              className="border border-black px-5 py-3 text-sm font-medium transition hover:bg-black hover:text-white"
            >
              Back to Dashboard
            </button> */}

          </div>

        </div>

      </div>

      {/* ================= CONTENT ================= */}

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">

        {/* ================= STATS ================= */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="border bg-white p-5">

            <p className="text-sm text-gray-500">
              Total Customers
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {totalCustomers}
            </p>

          </div>

          <div className="border bg-white p-5">

            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {totalOrders}
            </p>

          </div>

          <div className="border bg-white p-5">

            <p className="text-sm text-gray-500">
              Customer Revenue
            </p>

            <p className="mt-2 text-3xl font-semibold">
              ₹
              {totalRevenue.toLocaleString(
                "en-IN"
              )}
            </p>

          </div>

        </div>

        {/* ================= SEARCH ================= */}

        <div className="mt-8 border bg-white p-5">

          <label className="mb-2 block text-sm font-medium">
            Search Customers
          </label>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search by name, email or mobile..."
            className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
          />

        </div>

        {/* ================= CUSTOMER LIST ================= */}

        <div className="mt-6 overflow-hidden border bg-white">

          <div className="border-b px-5 py-4">

            <h2 className="font-semibold">
              Customer List
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Showing{" "}
              {filteredCustomers.length}{" "}
              customers
            </p>

          </div>

          {filteredCustomers.length === 0 ? (

            <div className="px-5 py-16 text-center">

              <p className="text-lg font-medium">
                No customers found
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Customers will appear here after they create an account or place an order.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[800px]">

                <thead className="bg-gray-50">

                  <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-500">

                    <th className="px-5 py-4 font-medium">
                      Customer
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Contact
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Orders
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Total Spent
                    </th>

                    <th className="px-5 py-4 font-medium">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right font-medium">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredCustomers.map(
                    (customer) => {

                      const spent =
                        getCustomerOrderTotal(
                          customer
                        );

                      return (
                        <tr
                          key={customer.id}
                          className="border-b last:border-b-0 hover:bg-gray-50"
                        >

                          {/* CUSTOMER */}

                          <td className="px-5 py-5">

                            <p className="font-medium">
                              {customer.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              ID: {customer.id}
                            </p>

                          </td>

                          {/* CONTACT */}

                          <td className="px-5 py-5">

                            <p className="text-sm">
                              {customer.email ||
                                "No email"}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {customer.mobile ||
                                "No mobile"}
                            </p>

                          </td>

                          {/* ORDERS */}

                          <td className="px-5 py-5">

                            <span className="text-sm font-medium">
                              {customer.orders.length}
                            </span>

                          </td>

                          {/* SPENT */}

                          <td className="px-5 py-5">

                            <span className="text-sm font-medium">
                              ₹
                              {spent.toLocaleString(
                                "en-IN"
                              )}
                            </span>

                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-5">

                            <span className="inline-flex border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                              Active
                            </span>

                          </td>

                          {/* ACTION */}

                          <td className="px-5 py-5 text-right">

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedCustomer(
                                  customer
                                )
                              }
                              className="border border-black px-4 py-2 text-xs font-medium transition hover:bg-black hover:text-white"
                            >
                              View Details
                            </button>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

      {/* ================= CUSTOMER DETAILS MODAL ================= */}

      {selectedCustomer && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">

          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-5">

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Customer Details
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {selectedCustomer.name}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedCustomer(
                    null
                  )
                }
                className="flex h-10 w-10 items-center justify-center text-2xl text-gray-500 hover:text-black"
              >
                ×
              </button>

            </div>

            {/* CUSTOMER INFO */}

            <div className="grid gap-4 border-b p-6 sm:grid-cols-3">

              <div>

                <p className="text-xs text-gray-500">
                  Name
                </p>

                <p className="mt-1 text-sm font-medium">
                  {selectedCustomer.name}
                </p>

              </div>

              <div>

                <p className="text-xs text-gray-500">
                  Email
                </p>

                <p className="mt-1 break-all text-sm font-medium">
                  {selectedCustomer.email ||
                    "Not available"}
                </p>

              </div>

              <div>

                <p className="text-xs text-gray-500">
                  Mobile
                </p>

                <p className="mt-1 text-sm font-medium">
                  {selectedCustomer.mobile ||
                    "Not available"}
                </p>

              </div>

            </div>

            {/* CUSTOMER ORDERS */}

            <div className="p-6">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-semibold">
                    Orders
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    {selectedCustomer.orders.length}{" "}
                    total orders
                  </p>

                </div>

                <p className="text-sm font-semibold">
                  ₹
                  {getCustomerOrderTotal(
                    selectedCustomer
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>

              </div>

              {selectedCustomer.orders.length ===
              0 ? (

                <div className="mt-5 border bg-gray-50 p-8 text-center">

                  <p className="text-sm text-gray-500">
                    No orders yet.
                  </p>

                </div>

              ) : (

                <div className="mt-5 space-y-3">

                  {selectedCustomer.orders.map(
                    (order) => (

                      <div
                        key={order.id}
                        className="border p-4"
                      >

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div>

                            <p className="text-sm font-semibold">
                              {order.id}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {formatDate(
                                order.orderDate
                              )}
                            </p>

                          </div>

                          <div className="flex items-center gap-4">

                            <span
                              className={`border px-3 py-1 text-xs font-medium ${
                                order.status ===
                                "Cancelled"
                                  ? "border-red-200 bg-red-50 text-red-600"
                                  : order.status ===
                                      "Delivered"
                                    ? "border-green-200 bg-green-50 text-green-700"
                                    : "border-blue-200 bg-blue-50 text-blue-700"
                              }`}
                            >
                              {order.status ||
                                "Placed"}
                            </span>

                            <span className="text-sm font-semibold">
                              ₹
                              {Number(
                                order.total || 0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

            {/* MODAL FOOTER */}

            <div className="border-t px-6 py-4 text-right">

              <button
                type="button"
                onClick={() =>
                  setSelectedCustomer(
                    null
                  )
                }
                className="border border-black px-5 py-3 text-sm font-medium transition hover:bg-black hover:text-white"
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}