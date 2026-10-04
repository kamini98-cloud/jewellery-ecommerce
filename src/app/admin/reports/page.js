"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminReportsPage() {
  const router = useRouter();

  const { user, isAuthLoaded } = useAuth();

  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [period, setPeriod] = useState("all");
  const [exporting, setExporting] = useState("");

  // ============================
  // LOAD DATA
  // ============================

  useEffect(() => {
    if (!isAuthLoaded) {
      return;
    }

    if (!user || user.role !== "admin") {
      router.replace("/admin/login");
      return;
    }

    const loadData = () => {
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
          "Failed to load orders:",
          error
        );
      }

      const uniqueOrders = Array.from(
        new Map(
          adminOrders.map((order) => [
            order.id,
            order,
          ])
        ).values()
      );

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
          "Failed to load coupons:",
          error
        );
      }

      setCoupons(adminCoupons);
    };

    loadData();

    window.addEventListener(
      "storage",
      loadData
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadData
      );
    };
  }, [isAuthLoaded, user, router]);

  // ============================
  // DATE FILTER
  // ============================

  const filteredOrders = useMemo(() => {
    if (period === "all") {
      return orders;
    }

    const now = new Date();
    const startDate = new Date();

    if (period === "today") {
      startDate.setHours(0, 0, 0, 0);
    }

    if (period === "week") {
      startDate.setDate(
        now.getDate() - 7
      );

      startDate.setHours(0, 0, 0, 0);
    }

    if (period === "month") {
      startDate.setMonth(
        now.getMonth() - 1
      );

      startDate.setHours(0, 0, 0, 0);
    }

    return orders.filter((order) => {
      if (!order.orderDate) {
        return false;
      }

      const orderDate =
        new Date(order.orderDate);

      return orderDate >= startDate;
    });
  }, [orders, period]);

  // ============================
  // SALES ORDERS
  // ============================

  const salesOrders = useMemo(() => {
    return filteredOrders.filter(
      (order) =>
        order.status !== "Cancelled"
    );
  }, [filteredOrders]);

  // ============================
  // TOTAL REVENUE
  // ============================

  const totalRevenue = useMemo(() => {
    return salesOrders.reduce(
      (total, order) =>
        total +
        Number(order.total || 0),
      0
    );
  }, [salesOrders]);

  // ============================
  // TOTAL ORDERS
  // ============================

  const totalOrders =
    filteredOrders.length;

  // ============================
  // AVERAGE ORDER VALUE
  // ============================

  const averageOrderValue = useMemo(() => {
    if (salesOrders.length === 0) {
      return 0;
    }

    return (
      totalRevenue /
      salesOrders.length
    );
  }, [totalRevenue, salesOrders]);

  // ============================
  // STATUS COUNTS
  // ============================

  const statusCounts = useMemo(() => {
    const statuses = [
      "Placed",
      "Confirmed",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    return statuses.map((status) => ({
      status,
      count: filteredOrders.filter(
        (order) =>
          (order.status || "Placed") ===
          status
      ).length,
    }));
  }, [filteredOrders]);

  // ============================
  // TOP PRODUCTS
  // ============================

  const topProducts = useMemo(() => {
    const productMap = {};

    salesOrders.forEach((order) => {
      const items =
        Array.isArray(order.items)
          ? order.items
          : [];

      items.forEach((item) => {
        const productId =
          item.id ||
          item.productId ||
          item.name;

        if (!productId) {
          return;
        }

        if (!productMap[productId]) {
          productMap[productId] = {
            id: productId,
            name:
              item.name ||
              "Unknown Product",
            quantity: 0,
            revenue: 0,
          };
        }

        const quantity =
          Number(
            item.quantity || 1
          );

        const price =
          Number(
            item.price || 0
          );

        productMap[productId].quantity +=
          quantity;

        productMap[productId].revenue +=
          price * quantity;
      });
    });

    return Object.values(productMap)
      .sort(
        (a, b) =>
          b.quantity - a.quantity
      )
      .slice(0, 5);
  }, [salesOrders]);

  // ============================
  // COUPON REPORT
  // ============================

  const couponReport = useMemo(() => {
    const couponMap = {};

    filteredOrders.forEach((order) => {
      if (!order.couponCode) {
        return;
      }

      const code =
        order.couponCode;

      if (!couponMap[code]) {
        couponMap[code] = {
          code,
          uses: 0,
          discount: 0,
        };
      }

      couponMap[code].uses += 1;

      couponMap[code].discount +=
        Number(
          order.discount || 0
        );
    });

    return Object.values(couponMap)
      .sort(
        (a, b) =>
          b.uses - a.uses
      )
      .slice(0, 5);
  }, [filteredOrders]);

  // ============================
  // PERIOD LABEL
  // ============================

  const periodLabel = useMemo(() => {
    switch (period) {
      case "today":
        return "Today";

      case "week":
        return "Last 7 Days";

      case "month":
        return "Last 30 Days";

      default:
        return "All Time";
    }
  }, [period]);

  // ============================
  // DATE FORMAT
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
  // DOWNLOAD PDF
  // ============================

  const downloadPDF = async () => {
    try {
      setExporting("pdf");

      const jsPDFModule =
        await import("jspdf");

      const autoTableModule =
        await import("jspdf-autotable");

      const jsPDF =
        jsPDFModule.default;

      const autoTable =
        autoTableModule.default;

      const doc =
        new jsPDF();

      doc.setFontSize(20);
      doc.text(
        "Jewellery Store Report",
        14,
        20
      );

      doc.setFontSize(11);
      doc.text(
        `Period: ${periodLabel}`,
        14,
        29
      );

      doc.text(
        `Generated: ${formatDate(
          new Date()
        )}`,
        14,
        36
      );

      // ============================
      // SUMMARY
      // ============================

      doc.setFontSize(14);
      doc.text(
        "Sales Summary",
        14,
        48
      );

      autoTable(doc, {
        startY: 53,
        head: [
          [
            "Metric",
            "Value",
          ],
        ],
        body: [
          [
            "Revenue",
            `₹${totalRevenue.toLocaleString(
              "en-IN"
            )}`,
          ],
          [
            "Total Orders",
            totalOrders,
          ],
          [
            "Completed Orders",
            salesOrders.length,
          ],
          [
            "Average Order Value",
            `₹${Math.round(
              averageOrderValue
            ).toLocaleString(
              "en-IN"
            )}`,
          ],
        ],
      });

      // ============================
      // ORDER STATUS
      // ============================

      let currentY =
        doc.lastAutoTable.finalY + 12;

      doc.setFontSize(14);
      doc.text(
        "Order Status",
        14,
        currentY
      );

      autoTable(doc, {
        startY: currentY + 5,
        head: [
          [
            "Status",
            "Orders",
          ],
        ],
        body:
          statusCounts.map(
            (item) => [
              item.status,
              item.count,
            ]
          ),
      });

      // ============================
      // TOP PRODUCTS
      // ============================

      currentY =
        doc.lastAutoTable.finalY + 12;

      doc.setFontSize(14);
      doc.text(
        "Top Selling Products",
        14,
        currentY
      );

      autoTable(doc, {
        startY: currentY + 5,
        head: [
          [
            "Product",
            "Units Sold",
            "Revenue",
          ],
        ],
        body:
          topProducts.map(
            (product) => [
              product.name,
              product.quantity,
              `₹${product.revenue.toLocaleString(
                "en-IN"
              )}`,
            ]
          ),
      });

      // ============================
      // COUPONS
      // ============================

      currentY =
        doc.lastAutoTable.finalY + 12;

      doc.setFontSize(14);
      doc.text(
        "Coupon Performance",
        14,
        currentY
      );

      autoTable(doc, {
        startY: currentY + 5,
        head: [
          [
            "Coupon",
            "Uses",
            "Discount",
          ],
        ],
        body:
          couponReport.map(
            (coupon) => [
              coupon.code,
              coupon.uses,
              `₹${coupon.discount.toLocaleString(
                "en-IN"
              )}`,
            ]
          ),
      });

      doc.save(
        `jewellery-store-report-${period}.pdf`
      );
    } catch (error) {
      console.error(
        "PDF export failed:",
        error
      );

      alert(
        "Unable to generate PDF report."
      );
    } finally {
      setExporting("");
    }
  };

  // ============================
  // DOWNLOAD WORD
  // ============================

  const downloadWord = async () => {
    try {
      setExporting("word");

      const {
        Document,
        Packer,
        Paragraph,
        HeadingLevel,
        Table,
        TableRow,
        TableCell,
        WidthType,
      } = await import("docx");

      const createRow = (
        values,
        bold = false
      ) => {
        return new TableRow({
          children:
            values.map(
              (value) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      text: String(
                        value
                      ),
                      bold,
                    }),
                  ],
                })
            ),
        });
      };

      const children = [
        new Paragraph({
          text: "Jewellery Store Report",
          heading:
            HeadingLevel.TITLE,
        }),

        new Paragraph({
          text: `Period: ${periodLabel}`,
        }),

        new Paragraph({
          text: `Generated: ${formatDate(
            new Date()
          )}`,
        }),

        new Paragraph({
          text: "Sales Summary",
          heading:
            HeadingLevel.HEADING_1,
        }),

        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            createRow(
              ["Metric", "Value"],
              true
            ),
            createRow([
              "Revenue",
              `₹${totalRevenue.toLocaleString(
                "en-IN"
              )}`,
            ]),
            createRow([
              "Total Orders",
              totalOrders,
            ]),
            createRow([
              "Completed Orders",
              salesOrders.length,
            ]),
            createRow([
              "Average Order Value",
              `₹${Math.round(
                averageOrderValue
              ).toLocaleString(
                "en-IN"
              )}`,
            ]),
          ],
        }),

        new Paragraph({
          text: "Order Status",
          heading:
            HeadingLevel.HEADING_1,
        }),

        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            createRow(
              ["Status", "Orders"],
              true
            ),
            ...statusCounts.map(
              (item) =>
                createRow([
                  item.status,
                  item.count,
                ])
            ),
          ],
        }),

        new Paragraph({
          text: "Top Selling Products",
          heading:
            HeadingLevel.HEADING_1,
        }),

        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            createRow(
              [
                "Product",
                "Units Sold",
                "Revenue",
              ],
              true
            ),
            ...topProducts.map(
              (product) =>
                createRow([
                  product.name,
                  product.quantity,
                  `₹${product.revenue.toLocaleString(
                    "en-IN"
                  )}`,
                ])
            ),
          ],
        }),

        new Paragraph({
          text: "Coupon Performance",
          heading:
            HeadingLevel.HEADING_1,
        }),

        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            createRow(
              [
                "Coupon",
                "Uses",
                "Discount",
              ],
              true
            ),
            ...couponReport.map(
              (coupon) =>
                createRow([
                  coupon.code,
                  coupon.uses,
                  `₹${coupon.discount.toLocaleString(
                    "en-IN"
                  )}`,
                ])
            ),
          ],
        }),
      ];

      const doc =
        new Document({
          sections: [
            {
              children,
            },
          ],
        });

      const blob =
        await Packer.toBlob(doc);

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `jewellery-store-report-${period}.docx`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Word export failed:",
        error
      );

      alert(
        "Unable to generate Word report."
      );
    } finally {
      setExporting("");
    }
  };

  // ============================
  // DOWNLOAD EXCEL
  // ============================

  const downloadExcel = async () => {
    try {
      setExporting("excel");

      const XLSX =
        await import("xlsx");

      // ============================
      // SUMMARY SHEET
      // ============================

      const summaryData = [
        {
          Metric: "Report Period",
          Value: periodLabel,
        },
        {
          Metric: "Generated",
          Value: formatDate(
            new Date()
          ),
        },
        {
          Metric: "Revenue",
          Value: totalRevenue,
        },
        {
          Metric: "Total Orders",
          Value: totalOrders,
        },
        {
          Metric: "Completed Orders",
          Value: salesOrders.length,
        },
        {
          Metric: "Average Order Value",
          Value: Math.round(
            averageOrderValue
          ),
        },
      ];

      // ============================
      // ORDERS SHEET
      // ============================

      const ordersData =
        filteredOrders.map(
          (order) => ({
            "Order ID":
              order.id || "",
            Customer:
              order.customer?.fullName ||
              "Guest Customer",
            Email:
              order.customer?.email ||
              "",
            Status:
              order.status ||
              "Placed",
            "Order Date":
              formatDate(
                order.orderDate
              ),
            "Payment Method":
              order.paymentMethod ||
              "",
            Subtotal:
              Number(
                order.subtotal || 0
              ),
            Discount:
              Number(
                order.discount || 0
              ),
            Total:
              Number(
                order.total || 0
              ),
            Coupon:
              order.couponCode ||
              "",
          })
        );

      // ============================
      // TOP PRODUCTS SHEET
      // ============================

      const productsData =
        topProducts.map(
          (product) => ({
            Rank:
              topProducts.indexOf(
                product
              ) + 1,
            Product:
              product.name,
            "Units Sold":
              product.quantity,
            Revenue:
              product.revenue,
          })
        );

      // ============================
      // COUPON SHEET
      // ============================

      const couponData =
        couponReport.map(
          (coupon) => ({
            Coupon:
              coupon.code,
            Uses:
              coupon.uses,
            "Discount Given":
              coupon.discount,
          })
        );

      // ============================
      // STATUS SHEET
      // ============================

      const statusData =
        statusCounts.map(
          (item) => ({
            Status:
              item.status,
            Orders:
              item.count,
          })
        );

      // ============================
      // CREATE WORKBOOK
      // ============================

      const workbook =
        XLSX.utils.book_new();

      const summarySheet =
        XLSX.utils.json_to_sheet(
          summaryData
        );

      const ordersSheet =
        XLSX.utils.json_to_sheet(
          ordersData
        );

      const productsSheet =
        XLSX.utils.json_to_sheet(
          productsData
        );

      const couponSheet =
        XLSX.utils.json_to_sheet(
          couponData
        );

      const statusSheet =
        XLSX.utils.json_to_sheet(
          statusData
        );

      XLSX.utils.book_append_sheet(
        workbook,
        summarySheet,
        "Sales Summary"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        ordersSheet,
        "Orders"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        productsSheet,
        "Top Products"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        couponSheet,
        "Coupons"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        statusSheet,
        "Order Status"
      );

      XLSX.writeFile(
        workbook,
        `jewellery-store-report-${period}.xlsx`
      );
    } catch (error) {
      console.error(
        "Excel export failed:",
        error
      );

      alert(
        "Unable to generate Excel report."
      );
    } finally {
      setExporting("");
    }
  };

  // ============================
  // SHARE REPORT
  // ============================

  const shareReport = async () => {
    try {
      setExporting("share");

      const reportText = `
Jewellery Store Report

Period: ${periodLabel}

Revenue: ₹${totalRevenue.toLocaleString(
        "en-IN"
      )}

Total Orders: ${totalOrders}

Completed Orders: ${salesOrders.length}

Average Order Value: ₹${Math.round(
        averageOrderValue
      ).toLocaleString("en-IN")}

Generated: ${formatDate(
        new Date()
      )}
      `.trim();

      if (
        navigator.share
      ) {
        await navigator.share({
          title:
            "Jewellery Store Report",
          text: reportText,
        });
      } else {
        await navigator.clipboard.writeText(
          reportText
        );

        alert(
          "Report summary copied to clipboard."
        );
      }
    } catch (error) {
      if (
        error?.name !==
        "AbortError"
      ) {
        console.error(
          "Share failed:",
          error
        );

        alert(
          "Unable to share report."
        );
      }
    } finally {
      setExporting("");
    }
  };

  // ============================
  // PRINT REPORT
  // ============================

  const printReport = () => {
    window.print();
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

  if (
    !user ||
    user.role !== "admin"
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          Redirecting...
        </p>
      </main>
    );
  }

  // ============================
  // PAGE
  // ============================

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ================= HEADER ================= */}

      <div className="border-b bg-white print:hidden">

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                Admin Panel
              </p>

              <h1 className="mt-1 text-3xl font-semibold">
                Reports
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Sales and store performance overview.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">


  <select
            value={period}
            onChange={(e) =>
              setPeriod(
                e.target.value
              )
            }
            className="border border-gray-300 bg-white px-4 py-2 text-sm outline-none focus:border-black"
          >
            <option value="all">
              All Time
            </option>

            <option value="today">
              Today
            </option>

            <option value="week">
              Last 7 Days
            </option>

            <option value="month">
              Last 30 Days
            </option>
          </select>




              <button
                type="button"
                onClick={downloadPDF}
                disabled={!!exporting}
                className="border border-gray-300 bg-white px-4 py-2 text-sm transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting === "pdf"
                  ? "Generating..."
                  : "📄 PDF"}
              </button>

              <button
                type="button"
                onClick={downloadWord}
                disabled={!!exporting}
                className="border border-gray-300 bg-white px-4 py-2 text-sm transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting === "word"
                  ? "Generating..."
                  : "📝 Word"}
              </button>

              <button
                type="button"
                onClick={downloadExcel}
                disabled={!!exporting}
                className="border border-gray-300 bg-white px-4 py-2 text-sm transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting === "excel"
                  ? "Generating..."
                  : "📊 Excel"}
              </button>

              <button
                type="button"
                onClick={shareReport}
                disabled={!!exporting}
                className="border border-gray-300 bg-white px-4 py-2 text-sm transition hover:border-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {exporting === "share"
                  ? "Sharing..."
                  : "📤 Share"}
              </button>

              <button
                type="button"
                onClick={printReport}
                className="border border-gray-300 bg-white px-4 py-2 text-sm transition hover:border-black"
              >
                🖨️ Print
              </button>

              <Link
                href="/admin"
                className="border border-gray-300 bg-white px-4 py-2 text-sm transition hover:border-black"
              >
                ← Dashboard
              </Link>

            </div>

          </div>

        </div>

      </div>

      {/* ================= CONTENT ================= */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ================= FILTER ================= */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center print:hidden">

          <div>

            <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
              Sales Period
            </p>

            <h2 className="mt-1 text-xl font-semibold">
              Performance Overview
            </h2>

          </div>

        

        </div>

        {/* ================= PRINT TITLE ================= */}

        <div className="hidden print:block">

          <h1 className="text-2xl font-bold">
            Jewellery Store Report
          </h1>

          <p className="mt-2 text-sm">
            Period: {periodLabel}
          </p>

          <p className="text-sm">
            Generated:{" "}
            {formatDate(new Date())}
          </p>

        </div>

        {/* ================= SALES STATS ================= */}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

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

          {/* ORDERS */}

          <div className="border border-gray-200 bg-white p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Orders
            </p>

            <p className="mt-2 text-3xl font-semibold">
              {totalOrders}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Orders in selected period
            </p>

          </div>

          {/* AOV */}

          <div className="border border-gray-200 bg-white p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Average Order Value
            </p>

            <p className="mt-2 text-3xl font-semibold">
              ₹
              {Math.round(
                averageOrderValue
              ).toLocaleString(
                "en-IN"
              )}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Average completed order
            </p>

          </div>

          {/* DELIVERED */}

          <div className="border border-gray-200 bg-white p-5">

            <p className="text-xs uppercase tracking-wide text-gray-500">
              Delivered
            </p>

            <p className="mt-2 text-3xl font-semibold text-green-600">
              {
                statusCounts.find(
                  (item) =>
                    item.status ===
                    "Delivered"
                )?.count || 0
              }
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Successfully delivered
            </p>

          </div>

        </div>

        {/* ================= ORDER STATUS ================= */}

        <div className="mt-8">

          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Orders
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Order Status
          </h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {statusCounts.map(
              (item) => (

                <div
                  key={item.status}
                  className="border border-gray-200 bg-white p-5"
                >

                  <div className="flex items-center justify-between gap-4">

                    <span
                      className={`border px-3 py-1 text-xs font-medium ${getStatusStyle(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>

                    <span className="text-2xl font-semibold">
                      {item.count}
                    </span>

                  </div>

                </div>

              )
            )}

          </div>

        </div>

        {/* ================= TOP PRODUCTS ================= */}

        <div className="mt-8">

          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Products
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Top Selling Products
          </h2>

          <div className="mt-4 border border-gray-200 bg-white">

            {topProducts.length === 0 ? (

              <div className="px-6 py-12 text-center">

                <p className="font-medium">
                  No product sales yet
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Product sales will appear here after orders are placed.
                </p>

              </div>

            ) : (

              <div className="divide-y">

                {topProducts.map(
                  (product, index) => (

                    <div
                      key={product.id}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div className="flex items-center gap-4">

                        <div className="flex h-9 w-9 items-center justify-center border border-gray-200 text-sm font-semibold">
                          {index + 1}
                        </div>

                        <div>

                          <p className="font-medium">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {product.quantity} units sold
                          </p>

                        </div>

                      </div>

                      <p className="font-semibold">
                        ₹
                        {product.revenue.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

        {/* ================= COUPON REPORT ================= */}

        <div className="mt-8">

          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Discounts
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Coupon Performance
          </h2>

          <div className="mt-4 border border-gray-200 bg-white">

            {couponReport.length === 0 ? (

              <div className="px-6 py-12 text-center">

                <p className="font-medium">
                  No coupon usage yet
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Coupon usage will appear here after customers use coupons.
                </p>

              </div>

            ) : (

              <div className="divide-y">

                {couponReport.map(
                  (coupon) => (

                    <div
                      key={coupon.code}
                      className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div>

                        <p className="font-semibold">
                          {coupon.code}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {coupon.uses} use
                          {coupon.uses !== 1
                            ? "s"
                            : ""}
                        </p>

                      </div>

                      <div className="text-left sm:text-right">

                        <p className="font-semibold">
                          ₹
                          {coupon.discount.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Total discount given
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </div>

        {/* ================= RECENT SALES ================= */}

        <div className="mt-8 pb-10">

          <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
            Sales
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Recent Sales
          </h2>

          <div className="mt-4 border border-gray-200 bg-white">

            {salesOrders.length === 0 ? (

              <div className="px-6 py-12 text-center">

                <p className="font-medium">
                  No sales yet
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Completed sales will appear here.
                </p>

              </div>

            ) : (

              <div className="divide-y">

                {salesOrders
                  .slice(0, 10)
                  .map((order) => {

                    const customerName =
                      order.customer?.fullName ||
                      "Guest Customer";

                    return (

                      <div
                        key={order.id}
                        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                      >

                        <div>

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

                        <div className="text-left sm:text-right">

                          <p className="font-semibold">
                            ₹
                            {Number(
                              order.total || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          <p className="mt-1 text-xs text-green-600">
                            {order.status ||
                              "Placed"}
                          </p>

                        </div>

                      </div>

                    );
                  })}

              </div>

            )}

          </div>

        </div>

      </div>

    </main>
  );
}