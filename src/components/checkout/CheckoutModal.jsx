"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function CheckoutModal({ isOpen, onClose }) {
  const router = useRouter();

  const {
    cartItems,
    cartTotal,
    totalItems,
    clearCart,
  } = useCart();

  const {
    user,
    updateUser,
    isAuthLoaded,
  } = useAuth();

  const [showCloseConfirmation, setShowCloseConfirmation] =
    useState(false);

  const [selectedAddressId, setSelectedAddressId] =
    useState(null);

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  // ============================
  // COUPON STATE
  // ============================

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponError, setCouponError] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);

  // ============================
  // INVENTORY ERROR
  // ============================

  const [inventoryError, setInventoryError] =
    useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    pincode: "",

    // PAYMENT DETAILS
    upiId: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const [errors, setErrors] = useState({});

  // ============================
  // GET SAVED ADDRESSES
  // ============================

  const addresses = user?.addresses || [];

  // ============================
  // CHECK LOGIN + ADDRESS
  // ============================

  useEffect(() => {
    if (!isOpen || !isAuthLoaded) {
      return;
    }

    if (!user) {
      onClose();
      router.push("/login");
      return;
    }

    if (addresses.length === 0) {
      onClose();
      router.push("/account/address");
      return;
    }

    if (!selectedAddressId && addresses.length > 0) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [
    isOpen,
    isAuthLoaded,
    user,
    addresses.length,
    selectedAddressId,
    router,
    onClose,
  ]);

  // ============================
  // UPDATE FORM FROM ADDRESS
  // ============================

  useEffect(() => {
    if (!user || !selectedAddressId) {
      return;
    }

    const selectedAddress = addresses.find(
      (address) => address.id === selectedAddressId
    );

    if (!selectedAddress) {
      return;
    }

    setFormData((current) => ({
      ...current,

      fullName:
        selectedAddress.fullName ||
        user.name ||
        "",

      phone:
        selectedAddress.mobile ||
        user.mobile ||
        "",

      email:
        user.email ||
        "",

      address:
        selectedAddress.address ||
        "",

      apartment:
        selectedAddress.locality ||
        "",

      city:
        selectedAddress.city ||
        "",

      state:
        selectedAddress.state ||
        "",

      pincode:
        selectedAddress.pincode ||
        "",
    }));
  }, [
    selectedAddressId,
    user,
    addresses,
  ]);

  // ============================
  // LOAD ADMIN COUPONS
  // ============================

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadCoupons = () => {
      try {
        const storedCoupons =
          localStorage.getItem("adminCoupons");

        if (!storedCoupons) {
          setAvailableCoupons([]);
          return;
        }

        const parsedCoupons = JSON.parse(storedCoupons);

        setAvailableCoupons(
          Array.isArray(parsedCoupons)
            ? parsedCoupons
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load admin coupons:",
          error
        );

        setAvailableCoupons([]);
      }
    };

    loadCoupons();

    window.addEventListener(
      "storage",
      loadCoupons
    );

    return () => {
      window.removeEventListener(
        "storage",
        loadCoupons
      );
    };
  }, []);

  // ============================
  // COUPON DISCOUNT
  // ============================

  const discountAmount = appliedCoupon
    ? appliedCoupon.discount
    : 0;

  const finalTotal = Math.max(
    0,
    cartTotal - discountAmount
  );

  // ============================
  // SELECT COUPON
  // ============================

  const handleSelectCoupon = (code) => {
    setCouponCode(code);
    setCouponMessage("");
    setCouponError("");
  };

  // ============================
  // APPLY COUPON
  // ============================

  const handleApplyCoupon = () => {
    const code = couponCode
      .trim()
      .toUpperCase();

    setCouponMessage("");
    setCouponError("");

    if (!code) {
      setCouponError(
        "Please enter a coupon code."
      );
      return;
    }

    const coupon = availableCoupons.find(
      (item) =>
        String(item.code || "")
          .trim()
          .toUpperCase() === code
    );

    if (!coupon) {
      setCouponError(
        "Invalid coupon code. Please try again."
      );
      return;
    }

    // ============================
    // ACTIVE CHECK
    // ============================

    if (coupon.isActive === false) {
      setCouponError(
        "This coupon is currently inactive."
      );
      return;
    }

    // ============================
    // EXPIRY CHECK
    // ============================

    if (coupon.expiryDate) {
      const expiry = new Date(
        `${coupon.expiryDate}T23:59:59`
      );

      if (
        !Number.isNaN(expiry.getTime()) &&
        new Date() > expiry
      ) {
        setCouponError(
          "This coupon has expired."
        );
        return;
      }
    }

    // ============================
    // MINIMUM ORDER CHECK
    // ============================

    const minimumOrder = Number(
      coupon.minimumOrder || 0
    );

    if (cartTotal < minimumOrder) {
      setCouponError(
        `${code} is valid on orders of ₹${minimumOrder.toLocaleString(
          "en-IN"
        )} or more.`
      );

      return;
    }

    // ============================
    // USAGE LIMIT CHECK
    // ============================

    const usageLimit =
      coupon.usageLimit === "" ||
      coupon.usageLimit === null ||
      coupon.usageLimit === undefined
        ? null
        : Number(coupon.usageLimit);

    const usageCount = Number(
      coupon.usageCount || 0
    );

    if (
      usageLimit !== null &&
      !Number.isNaN(usageLimit) &&
      usageCount >= usageLimit
    ) {
      setCouponError(
        "This coupon has reached its usage limit."
      );

      return;
    }

    // ============================
    // CALCULATE DISCOUNT
    // ============================

    let discount = 0;

    if (
      coupon.discountType ===
      "percentage"
    ) {
      discount = Math.round(
        cartTotal *
          (Number(
            coupon.discountValue || 0
          ) / 100)
      );
    } else {
      discount = Number(
        coupon.discountValue || 0
      );
    }

    // Prevent discount from exceeding order value.
    discount = Math.max(
      0,
      Math.min(
        discount,
        cartTotal
      )
    );

    if (discount <= 0) {
      setCouponError(
        "This coupon does not provide a valid discount."
      );

      return;
    }

    const normalizedCode =
      String(coupon.code).toUpperCase();

    setAppliedCoupon({
      code: normalizedCode,
      type: coupon.discountType,
      discount,
      couponId: coupon.id,
    });

    setCouponCode(normalizedCode);

    if (
      coupon.discountType ===
      "percentage"
    ) {
      setCouponMessage(
        `Coupon applied! You saved ${Number(
          coupon.discountValue
        )}%.`
      );
    } else {
      setCouponMessage(
        `Coupon applied! You saved ₹${discount.toLocaleString(
          "en-IN"
        )}.`
      );
    }
  };

  // ============================
  // REMOVE COUPON
  // ============================

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("");
    setCouponError("");
  };

  // ============================
  // HANDLE INPUT CHANGE
  // ============================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  // ============================
  // FORMAT CARD NUMBER
  // ============================

  const handleCardNumberChange = (
    event
  ) => {
    const numbers =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 16);

    const formatted =
      numbers.replace(
        /(\d{4})(?=\d)/g,
        "$1 "
      );

    setFormData((current) => ({
      ...current,
      cardNumber: formatted,
    }));

    setErrors((current) => ({
      ...current,
      cardNumber: "",
    }));
  };

  // ============================
  // FORMAT CARD EXPIRY
  // ============================

  const handleCardExpiryChange = (
    event
  ) => {
    const numbers =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 4);

    let formatted = numbers;

    if (numbers.length > 2) {
      formatted =
        numbers.slice(0, 2) +
        "/" +
        numbers.slice(2);
    }

    setFormData((current) => ({
      ...current,
      cardExpiry: formatted,
    }));

    setErrors((current) => ({
      ...current,
      cardExpiry: "",
    }));
  };

  // ============================
  // FORMAT CVV
  // ============================

  const handleCvvChange = (event) => {
    const numbers =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 3);

    setFormData((current) => ({
      ...current,
      cardCvv: numbers,
    }));

    setErrors((current) => ({
      ...current,
      cardCvv: "",
    }));
  };

  // ============================
  // VALIDATE FORM
  // ============================

  const validateForm = () => {
    const newErrors = {};

    if (!selectedAddressId) {
      newErrors.addressSelection =
        "Please select a delivery address";
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName =
        "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required";
    } else if (
      !/^[6-9]\d{9}$/.test(
        formData.phone
      )
    ) {
      newErrors.phone =
        "Enter a valid 10-digit phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address =
        "Address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city =
        "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state =
        "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode =
        "Pincode is required";
    } else if (
      !/^\d{6}$/.test(
        formData.pincode
      )
    ) {
      newErrors.pincode =
        "Enter a valid 6-digit pincode";
    }

    // ============================
    // PAYMENT VALIDATION
    // ============================

    if (paymentMethod === "upi") {
      if (!formData.upiId.trim()) {
        newErrors.upiId =
          "UPI ID is required";
      } else if (
        !/^[\w.-]+@[\w.-]+$/.test(
          formData.upiId
        )
      ) {
        newErrors.upiId =
          "Enter a valid UPI ID";
      }
    }

    if (paymentMethod === "card") {
      const cardNumber =
        formData.cardNumber.replace(
          /\s/g,
          ""
        );

      if (!cardNumber) {
        newErrors.cardNumber =
          "Card number is required";
      } else if (
        !/^\d{16}$/.test(
          cardNumber
        )
      ) {
        newErrors.cardNumber =
          "Enter a valid 16-digit card number";
      }

      if (!formData.cardName.trim()) {
        newErrors.cardName =
          "Cardholder name is required";
      }

      if (!formData.cardExpiry.trim()) {
        newErrors.cardExpiry =
          "Expiry date is required";
      } else if (
        !/^(0[1-9]|1[0-2])\/\d{2}$/.test(
          formData.cardExpiry
        )
      ) {
        newErrors.cardExpiry =
          "Use MM/YY format";
      }

      if (!formData.cardCvv.trim()) {
        newErrors.cardCvv =
          "CVV is required";
      } else if (
        !/^\d{3}$/.test(
          formData.cardCvv
        )
      ) {
        newErrors.cardCvv =
          "Enter a valid 3-digit CVV";
      }
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors)
        .length === 0
    );
  };

  // ============================
  // CREATE ADMIN ORDER NOTIFICATION
  // ============================

  const createOrderNotification = (
    order
  ) => {
    try {
      const storedNotifications =
        localStorage.getItem(
          "adminNotifications"
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
            "Failed to parse admin notifications:",
            error
          );
        }
      }

      const notification = {
        id:
          typeof crypto !== "undefined" &&
          crypto.randomUUID
            ? `NOTIF-${crypto.randomUUID()}`
            : `NOTIF-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`,

        type: "new-order",

        title: "New Order Received",

        message: `${
          order.customer.fullName
        } placed a new order of ₹${Number(
          order.total || 0
        ).toLocaleString("en-IN")}.`,

        orderId: order.id,

        customerName:
          order.customer.fullName,

        amount: order.total,

        createdAt:
          new Date().toISOString(),

        isRead: false,
      };

      const updatedNotifications = [
        notification,
        ...notifications,
      ];

      localStorage.setItem(
        "adminNotifications",
        JSON.stringify(
          updatedNotifications
        )
      );
    } catch (error) {
      console.error(
        "Failed to create order notification:",
        error
      );
    }
  };

  // ============================
  // CREATE INVENTORY NOTIFICATION
  // ============================

  const createInventoryNotification = (
    product,
    type,
    quantity
  ) => {
    try {
      const storedNotifications =
        localStorage.getItem(
          "adminNotifications"
        );

      let notifications = [];

      if (storedNotifications) {
        try {
          const parsed =
            JSON.parse(
              storedNotifications
            );

          if (Array.isArray(parsed)) {
            notifications = parsed;
          }
        } catch (error) {
          console.error(
            "Failed to parse notifications:",
            error
          );
        }
      }

      let title = "";
      let message = "";

      if (type === "low-stock") {
        title = "Low Stock Alert";

        message = `${product.name} is running low on stock. Only ${quantity} item${
          quantity === 1
            ? ""
            : "s"
        } remaining.`;
      }

      if (type === "out-of-stock") {
        title = "Product Out of Stock";

        message = `${product.name} is now out of stock.`;
      }

      const notification = {
        id:
          typeof crypto !== "undefined" &&
          crypto.randomUUID
            ? `NOTIF-${crypto.randomUUID()}`
            : `NOTIF-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`,

        type,

        title,

        message,

        productId: product.id,

        productName:
          product.name,

        quantity,

        createdAt:
          new Date().toISOString(),

        isRead: false,
      };

      const updatedNotifications = [
        notification,
        ...notifications,
      ];

      localStorage.setItem(
        "adminNotifications",
        JSON.stringify(
          updatedNotifications
        )
      );
    } catch (error) {
      console.error(
        "Failed to create inventory notification:",
        error
      );
    }
  };

  // ============================
  // DEDUCT INVENTORY
  // ============================

  const deductInventory = () => {
    try {
      const storedInventory =
        localStorage.getItem(
          "adminInventory"
        );

      // If inventory has never been
      // initialized, keep existing
      // behaviour.
      if (!storedInventory) {
        return {
          success: true,
        };
      }

      const inventory =
        JSON.parse(storedInventory);

      if (
        !inventory ||
        typeof inventory !==
          "object" ||
        Array.isArray(inventory)
      ) {
        console.error(
          "Invalid admin inventory format."
        );

        return {
          success: false,
          error:
            "Invalid inventory data.",
        };
      }

      // ==========================================
      // CHECK ALL PRODUCTS FIRST
      // ==========================================

      for (const item of cartItems) {
        const productId =
          String(item.id);

        const currentStock =
          Number(
            inventory[productId] ?? 0
          );

        const requestedQuantity =
          Number(item.quantity) || 0;

        if (
          requestedQuantity <= 0
        ) {
          return {
            success: false,
            error:
              `${item.name} has an invalid quantity.`,
          };
        }

        if (
          currentStock <
          requestedQuantity
        ) {
          return {
            success: false,
            error:
              `${item.name} does not have enough stock available. Only ${currentStock} item${
                currentStock === 1
                  ? ""
                  : "s"
              } remaining.`,
          };
        }
      }

      // ==========================================
      // CREATE UPDATED INVENTORY
      // ==========================================

      const updatedInventory = {
        ...inventory,
      };

      const inventoryNotifications = [];

      for (const item of cartItems) {
        const productId =
          String(item.id);

        const oldStock =
          Number(
            inventory[productId] ?? 0
          );

        const requestedQuantity =
          Number(item.quantity) || 0;

        const newStock =
          Math.max(
            0,
            oldStock -
              requestedQuantity
          );

        updatedInventory[productId] =
          newStock;

        // ========================================
        // OUT OF STOCK
        // ========================================

        if (
          oldStock > 0 &&
          newStock === 0
        ) {
          inventoryNotifications.push({
            product: item,
            type: "out-of-stock",
            quantity: 0,
          });
        }

        // ========================================
        // LOW STOCK
        // Only notify when crossing
        // from above 5 to 5 or below.
        // ========================================

        else if (
          oldStock > 5 &&
          newStock > 0 &&
          newStock <= 5
        ) {
          inventoryNotifications.push({
            product: item,
            type: "low-stock",
            quantity: newStock,
          });
        }
      }

      // ==========================================
      // SAVE INVENTORY
      // ==========================================

      localStorage.setItem(
        "adminInventory",
        JSON.stringify(
          updatedInventory
        )
      );

      // ==========================================
      // CREATE INVENTORY NOTIFICATIONS
      // ==========================================

      inventoryNotifications.forEach(
        (notification) => {
          createInventoryNotification(
            notification.product,
            notification.type,
            notification.quantity
          );
        }
      );

      return {
        success: true,
      };
    } catch (error) {
      console.error(
        "Failed to deduct inventory:",
        error
      );

      return {
        success: false,
        error:
          "Unable to update inventory.",
      };
    }
  };

  // ============================
  // SUBMIT CHECKOUT
  // ============================

  const handleSubmit = (event) => {
    event.preventDefault();

    setInventoryError("");

    if (!validateForm()) {
      return;
    }

    if (!user) {
      return;
    }

    if (
      !cartItems ||
      cartItems.length === 0
    ) {
      return;
    }

    // ==========================================
    // CHECK + DEDUCT INVENTORY
    // ==========================================

    const inventoryResult =
      deductInventory();

    if (!inventoryResult.success) {
      setInventoryError(
        inventoryResult.error ||
          "Some products are no longer available."
      );

      return;
    }

    const selectedAddress =
      addresses.find(
        (address) =>
          address.id ===
          selectedAddressId
      );

    // ============================
    // CREATE NEW ORDER
    // ============================

    const newOrder = {
      id: `ORD-${Date.now()}`,

      orderDate:
        new Date().toISOString(),

      status: "Placed",

      paymentMethod,

      // COUPON DETAILS
      couponCode:
        appliedCoupon?.code ||
        null,

      discount:
        discountAmount,

      // CUSTOMER INFORMATION
      customer: {
        fullName:
          formData.fullName,

        email:
          formData.email,

        phone:
          formData.phone,
      },

      // DELIVERY ADDRESS
      address: {
        fullName:
          formData.fullName,

        mobile:
          formData.phone,

        address:
          formData.address,

        locality:
          formData.apartment,

        city:
          formData.city,

        state:
          formData.state,

        pincode:
          formData.pincode,

        addressType:
          selectedAddress
            ?.addressType ||
          "Home",
      },

      // PRODUCTS
      items: cartItems.map(
        (item) => ({
          ...item,
        })
      ),

      totalItems,

      // PRICE DETAILS
      subtotal:
        cartTotal,

      total:
        finalTotal,
    };

    // ============================
    // EXISTING CUSTOMER ORDERS
    // ============================

    const existingOrders =
      Array.isArray(user.orders)
        ? user.orders
        : [];

    const updatedOrders = [
      newOrder,
      ...existingOrders,
    ];

    // ============================
    // CREATE UPDATED USER
    // ============================

    const updatedUser = {
      ...user,

      orders:
        updatedOrders,
    };

    // ============================
    // SAVE CUSTOMER ORDER
    // ============================

    try {
      localStorage.setItem(
        "user",
        JSON.stringify(
          updatedUser
        )
      );
    } catch (error) {
      console.error(
        "Failed to save customer order:",
        error
      );

      return;
    }

    // ============================
    // SAVE ORDER FOR ADMIN
    // ============================

    try {
      const storedAdminOrders =
        localStorage.getItem(
          "adminOrders"
        );

      let adminOrders = [];

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
            adminOrders =
              parsedAdminOrders;
          }
        } catch (error) {
          console.error(
            "Failed to parse admin orders:",
            error
          );
        }
      }

      adminOrders = [
        newOrder,

        ...adminOrders.filter(
          (order) =>
            order.id !==
            newOrder.id
        ),
      ];

      localStorage.setItem(
        "adminOrders",
        JSON.stringify(
          adminOrders
        )
      );

      // ============================
      // CREATE NEW ORDER NOTIFICATION
      // ============================

      createOrderNotification(
        newOrder
      );
    } catch (error) {
      console.error(
        "Failed to save admin order:",
        error
      );
    }

    // ============================
    // UPDATE COUPON USAGE
    // ============================

    if (
      appliedCoupon?.couponId
    ) {
      try {
        const storedCoupons =
          localStorage.getItem(
            "adminCoupons"
          );

        if (storedCoupons) {
          const parsedCoupons =
            JSON.parse(
              storedCoupons
            );

          if (
            Array.isArray(
              parsedCoupons
            )
          ) {
            const updatedCoupons =
              parsedCoupons.map(
                (coupon) => {
                  if (
                    coupon.id !==
                    appliedCoupon.couponId
                  ) {
                    return coupon;
                  }

                  return {
                    ...coupon,

                    usageCount:
                      Number(
                        coupon.usageCount ||
                          0
                      ) + 1,

                    updatedAt:
                      new Date().toISOString(),
                  };
                }
              );

            localStorage.setItem(
              "adminCoupons",
              JSON.stringify(
                updatedCoupons
              )
            );
          }
        }
      } catch (error) {
        console.error(
          "Failed to update coupon usage:",
          error
        );
      }
    }

    // ============================
    // UPDATE AUTH CONTEXT
    // ============================

    updateUser({
      orders:
        updatedOrders,
    });

    // ============================
    // CLEAR CART
    // ============================

    clearCart();

    // ============================
    // CLOSE MODAL
    // ============================

    onClose();

    // ============================
    // REDIRECT TO ORDERS
    // ============================

    router.push(
      "/account/orders"
    );
  };

  // ============================
  // CLOSE CONFIRMATION
  // ============================

  const handleCloseRequest = () => {
    setShowCloseConfirmation(
      true
    );
  };

  const stayOnCheckout = () => {
    setShowCloseConfirmation(
      false
    );
  };

  const leaveCheckout = () => {
    setShowCloseConfirmation(
      false
    );

    onClose();
  };

  // ============================
  // DO NOT SHOW MODAL
  // ============================

  if (!isOpen) {
    return null;
  }

  // ============================
  // LOADING
  // ============================

  if (!isAuthLoaded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white px-8 py-6 text-sm">
          Loading checkout...
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 p-0 sm:p-6"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleCloseRequest();
        }
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden bg-white shadow-2xl sm:h-[95vh]">

        {/* ================= HEADER ================= */}

        <div className="flex flex-shrink-0 items-center justify-between border-b px-5 py-4 sm:px-8">

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Secure Checkout
            </p>

            <h2 className="mt-1 text-xl font-semibold sm:text-2xl">
              Checkout
            </h2>
          </div>

          <button
            type="button"
            onClick={
              handleCloseRequest
            }
            aria-label="Close checkout"
            className="flex h-10 w-10 items-center justify-center text-2xl text-gray-500 transition hover:text-black"
          >
            ×
          </button>

        </div>

        <div className="flex-1 overflow-y-auto">

          <form
            id="checkout-form"
            onSubmit={
              handleSubmit
            }
            className="grid gap-10 p-5 sm:p-8 lg:grid-cols-[1fr_360px] lg:p-10"
          >

            {/* ================= LEFT SIDE ================= */}

            <div className="space-y-10">

              {/* ================= DELIVERY ADDRESS ================= */}

              <section>

                <div className="flex items-center justify-between">

                  <h3 className="text-lg font-semibold">
                    Delivery Address
                  </h3>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(
                        "/account/address"
                      );
                    }}
                    className="text-sm underline"
                  >
                    Add Address
                  </button>

                </div>

                <div className="mt-5 space-y-3">

                  {addresses.map(
                    (address) => (

                      <button
                        key={
                          address.id
                        }
                        type="button"
                        onClick={() => {
                          setSelectedAddressId(
                            address.id
                          );

                          setErrors(
                            (current) => ({
                              ...current,
                              addressSelection:
                                "",
                            })
                          );
                        }}
                        className={`w-full border p-4 text-left transition ${
                          selectedAddressId ===
                          address.id
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <p className="font-medium">
                              {
                                address.fullName
                              }
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              +91{" "}
                              {
                                address.mobile
                              }
                            </p>

                          </div>

                          <span className="border px-2 py-1 text-xs">
                            {
                              address.addressType
                            }
                          </span>

                        </div>

                        <div className="mt-3 text-sm leading-6 text-gray-600">

                          <p>
                            {
                              address.address
                            }
                          </p>

                          {address.locality && (
                            <p>
                              {
                                address.locality
                              }
                            </p>
                          )}

                          <p>
                            {
                              address.city
                            }
                            ,{" "}
                            {
                              address.state
                            }{" "}
                            -{" "}
                            {
                              address.pincode
                            }
                          </p>

                        </div>

                      </button>

                    )
                  )}

                </div>

                {errors.addressSelection && (
                  <p className="mt-2 text-xs text-red-600">
                    {
                      errors.addressSelection
                    }
                  </p>
                )}

              </section>

              {/* ================= CONTACT INFORMATION ================= */}

              <section>

                <h3 className="text-lg font-semibold">
                  Contact Information
                </h3>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">

                  <div className="sm:col-span-2">

                    <label className="mb-2 block text-sm font-medium">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="fullName"
                      value={
                        formData.fullName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your full name"
                      className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                    />

                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-600">
                        {
                          errors.fullName
                        }
                      </p>
                    )}

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="you@example.com"
                      className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                    />

                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {
                          errors.email
                        }
                      </p>
                    )}

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={
                        formData.phone
                      }
                      onChange={(
                        event
                      ) => {
                        const numbers =
                          event.target.value
                            .replace(
                              /\D/g,
                              ""
                            )
                            .slice(
                              0,
                              10
                            );

                        setFormData(
                          (current) => ({
                            ...current,
                            phone:
                              numbers,
                          })
                        );

                        setErrors(
                          (current) => ({
                            ...current,
                            phone:
                              "",
                          })
                        );
                      }}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                    />

                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">
                        {
                          errors.phone
                        }
                      </p>
                    )}

                  </div>

                </div>

              </section>

              {/* ================= ADDRESS DETAILS ================= */}

              <section>

                <h3 className="text-lg font-semibold">
                  Address Details
                </h3>

                <div className="mt-5 space-y-5">

                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Address
                    </label>

                    <textarea
                      name="address"
                      value={
                        formData.address
                      }
                      onChange={
                        handleChange
                      }
                      rows={3}
                      className="w-full resize-none border px-4 py-3 text-sm outline-none focus:border-black"
                    />

                    {errors.address && (
                      <p className="mt-1 text-xs text-red-600">
                        {
                          errors.address
                        }
                      </p>
                    )}

                  </div>

                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Locality / Area
                    </label>

                    <input
                      type="text"
                      name="apartment"
                      value={
                        formData.apartment
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                    />

                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">

                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        City
                      </label>

                      <input
                        type="text"
                        name="city"
                        value={
                          formData.city
                        }
                        onChange={
                          handleChange
                        }
                        className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                      />

                      {errors.city && (
                        <p className="mt-1 text-xs text-red-600">
                          {
                            errors.city
                          }
                        </p>
                      )}

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-medium">
                        State
                      </label>

                      <input
                        type="text"
                        name="state"
                        value={
                          formData.state
                        }
                        onChange={
                          handleChange
                        }
                        className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                      />

                      {errors.state && (
                        <p className="mt-1 text-xs text-red-600">
                          {
                            errors.state
                          }
                        </p>
                      )}

                    </div>

                  </div>

                  <div className="sm:w-1/2">

                    <label className="mb-2 block text-sm font-medium">
                      Pincode
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      value={
                        formData.pincode
                      }
                      onChange={(
                        event
                      ) => {
                        const numbers =
                          event.target.value
                            .replace(
                              /\D/g,
                              ""
                            )
                            .slice(
                              0,
                              6
                            );

                        setFormData(
                          (current) => ({
                            ...current,
                            pincode:
                              numbers,
                          })
                        );

                        setErrors(
                          (current) => ({
                            ...current,
                            pincode:
                              "",
                          })
                        );
                      }}
                      placeholder="6-digit pincode"
                      maxLength={6}
                      className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                    />

                    {errors.pincode && (
                      <p className="mt-1 text-xs text-red-600">
                        {
                          errors.pincode
                        }
                      </p>
                    )}

                  </div>

                </div>

              </section>

              {/* ================= PAYMENT METHOD ================= */}

              <section>

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="text-lg font-semibold">
                      Payment Method
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Choose how you want to pay.
                    </p>

                  </div>

                  <span className="text-xs text-gray-400">
                    Secure
                  </span>

                </div>

                <div className="mt-5 grid gap-3">

                  {[
                    {
                      id: "cod",
                      title:
                        "Cash on Delivery",
                      description:
                        "Pay when your order arrives.",
                      icon: "💵",
                    },
                    {
                      id: "upi",
                      title: "UPI",
                      description:
                        "Pay using any UPI app.",
                      icon: "📱",
                    },
                    {
                      id: "card",
                      title:
                        "Credit / Debit Card",
                      description:
                        "Pay securely using your card.",
                      icon: "💳",
                    },
                  ].map(
                    (method) => (

                      <button
                        key={
                          method.id
                        }
                        type="button"
                        onClick={() => {
                          setPaymentMethod(
                            method.id
                          );

                          setErrors(
                            (current) => ({
                              ...current,
                              upiId:
                                "",
                              cardNumber:
                                "",
                              cardName:
                                "",
                              cardExpiry:
                                "",
                              cardCvv:
                                "",
                            })
                          );
                        }}
                        className={`flex w-full items-center gap-4 border p-4 text-left transition ${
                          paymentMethod ===
                          method.id
                            ? "border-black bg-gray-50"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >

                        <div
                          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center border text-lg ${
                            paymentMethod ===
                            method.id
                              ? "border-black bg-black"
                              : "border-gray-200 bg-white"
                          }`}
                        >

                          <span
                            className={
                              paymentMethod ===
                              method.id
                                ? "grayscale"
                                : ""
                            }
                          >
                            {
                              method.icon
                            }
                          </span>

                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="font-medium">
                            {
                              method.title
                            }
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {
                              method.description
                            }
                          </p>

                        </div>

                        <div
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                            paymentMethod ===
                            method.id
                              ? "border-black"
                              : "border-gray-300"
                          }`}
                        >

                          {paymentMethod ===
                            method.id && (
                            <div className="h-2.5 w-2.5 rounded-full bg-black" />
                          )}

                        </div>

                      </button>

                    )
                  )}

                </div>

                {/* ================= COD INFO ================= */}

                {paymentMethod ===
                  "cod" && (

                  <div className="mt-4 border border-gray-200 bg-gray-50 p-4">

                    <div className="flex gap-3">

                      <span className="text-lg">
                        ✓
                      </span>

                      <div>

                        <p className="text-sm font-medium">
                          Cash on Delivery selected
                        </p>

                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          You can pay the delivery person when your order arrives.
                        </p>

                      </div>

                    </div>

                  </div>

                )}

                {/* ================= UPI DETAILS ================= */}

                {paymentMethod ===
                  "upi" && (

                  <div className="mt-4 border border-gray-200 p-5">

                    <label className="mb-2 block text-sm font-medium">
                      UPI ID
                    </label>

                    <input
                      type="text"
                      name="upiId"
                      value={
                        formData.upiId
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="example@upi"
                      autoComplete="off"
                      className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                    />

                    {errors.upiId && (
                      <p className="mt-1 text-xs text-red-600">
                        {
                          errors.upiId
                        }
                      </p>
                    )}

                    <p className="mt-2 text-xs text-gray-500">
                      Example: name@upi, name@ybl, name@okaxis
                    </p>

                  </div>

                )}

                {/* ================= CARD DETAILS ================= */}

                {paymentMethod ===
                  "card" && (

                  <div className="mt-4 border border-gray-200 p-5">

                    <div className="space-y-5">

                      <div>

                        <label className="mb-2 block text-sm font-medium">
                          Card Number
                        </label>

                        <input
                          type="text"
                          inputMode="numeric"
                          value={
                            formData.cardNumber
                          }
                          onChange={
                            handleCardNumberChange
                          }
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          autoComplete="off"
                          className="w-full border px-4 py-3 text-sm tracking-wider outline-none focus:border-black"
                        />

                        {errors.cardNumber && (
                          <p className="mt-1 text-xs text-red-600">
                            {
                              errors.cardNumber
                            }
                          </p>
                        )}

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-medium">
                          Cardholder Name
                        </label>

                        <input
                          type="text"
                          name="cardName"
                          value={
                            formData.cardName
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Name on card"
                          autoComplete="off"
                          className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                        />

                        {errors.cardName && (
                          <p className="mt-1 text-xs text-red-600">
                            {
                              errors.cardName
                            }
                          </p>
                        )}

                      </div>

                      <div className="grid grid-cols-2 gap-4">

                        <div>

                          <label className="mb-2 block text-sm font-medium">
                            Expiry
                          </label>

                          <input
                            type="text"
                            inputMode="numeric"
                            value={
                              formData.cardExpiry
                            }
                            onChange={
                              handleCardExpiryChange
                            }
                            placeholder="MM/YY"
                            maxLength={5}
                            autoComplete="off"
                            className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                          />

                          {errors.cardExpiry && (
                            <p className="mt-1 text-xs text-red-600">
                              {
                                errors.cardExpiry
                              }
                            </p>
                          )}

                        </div>

                        <div>

                          <label className="mb-2 block text-sm font-medium">
                            CVV
                          </label>

                          <input
                            type="password"
                            inputMode="numeric"
                            value={
                              formData.cardCvv
                            }
                            onChange={
                              handleCvvChange
                            }
                            placeholder="•••"
                            maxLength={3}
                            autoComplete="off"
                            className="w-full border px-4 py-3 text-sm outline-none focus:border-black"
                          />

                          {errors.cardCvv && (
                            <p className="mt-1 text-xs text-red-600">
                              {
                                errors.cardCvv
                              }
                            </p>
                          )}

                        </div>

                      </div>

                      <div className="border-t pt-4">

                        <p className="text-xs leading-5 text-gray-500">
                          🔒 This is a demo payment form. No real payment is processed.
                        </p>

                      </div>

                    </div>

                  </div>

                )}

              </section>

            </div>

            {/* ================= ORDER SUMMARY ================= */}

            <aside className="h-fit border p-5 sm:p-6 lg:sticky lg:top-0">

              <h3 className="text-lg font-semibold">
                Your Order
              </h3>

              <div className="mt-6 space-y-4">

                {cartItems.map(
                  (item) => (

                    <div
                      key={item.id}
                      className="flex justify-between gap-4 text-sm"
                    >

                      <div className="min-w-0">

                        <p className="font-medium">
                          {
                            item.name
                          }
                        </p>

                        <p className="mt-1 text-gray-500">
                          Qty:{" "}
                          {
                            item.quantity
                          }
                        </p>

                      </div>

                      <p className="flex-shrink-0 font-medium">
                        ₹
                        {(
                          item.price *
                          item.quantity
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </p>

                    </div>

                  )
                )}

              </div>

              {/* ================= COUPON ================= */}

              <div className="mt-6 border-t pt-6">

                <p className="mb-3 text-sm font-medium">
                  Have a coupon?
                </p>

                {!appliedCoupon && (
                  <>

                    {/* ================= AVAILABLE COUPONS ================= */}

                    <div className="mb-4">

                      <p className="mb-2 text-xs text-gray-500">
                        Available Coupons
                      </p>

                      <div className="grid gap-2">

                        {availableCoupons
                          .filter(
                            (coupon) => {
                              if (
                                coupon.isActive ===
                                false
                              ) {
                                return false;
                              }

                              if (
                                coupon.expiryDate
                              ) {
                                const expiry =
                                  new Date(
                                    `${coupon.expiryDate}T23:59:59`
                                  );

                                if (
                                  !Number.isNaN(
                                    expiry.getTime()
                                  ) &&
                                  new Date() >
                                    expiry
                                ) {
                                  return false;
                                }
                              }

                              const usageLimit =
                                coupon.usageLimit ===
                                  "" ||
                                coupon.usageLimit ===
                                  null ||
                                coupon.usageLimit ===
                                  undefined
                                  ? null
                                  : Number(
                                      coupon.usageLimit
                                    );

                              const usageCount =
                                Number(
                                  coupon.usageCount ||
                                    0
                                );

                              if (
                                usageLimit !==
                                  null &&
                                !Number.isNaN(
                                  usageLimit
                                ) &&
                                usageCount >=
                                  usageLimit
                              ) {
                                return false;
                              }

                              return true;
                            }
                          )
                          .map(
                            (coupon) => {
                              const code =
                                String(
                                  coupon.code ||
                                    ""
                                ).toUpperCase();

                              const discountText =
                                coupon.discountType ===
                                "percentage"
                                  ? `${Number(
                                      coupon.discountValue
                                    )}% OFF`
                                  : `₹${Number(
                                      coupon.discountValue ||
                                        0
                                    ).toLocaleString(
                                      "en-IN"
                                    )} OFF`;

                              const description =
                                coupon.description ||
                                (coupon.discountType ===
                                "percentage"
                                  ? `Get ${Number(
                                      coupon.discountValue
                                    )}% OFF on your order`
                                  : `Get ₹${Number(
                                      coupon.discountValue ||
                                        0
                                    ).toLocaleString(
                                      "en-IN"
                                    )} OFF on your order`);

                              return (
                                <button
                                  key={
                                    coupon.id ||
                                    code
                                  }
                                  type="button"
                                  onClick={() =>
                                    handleSelectCoupon(
                                      code
                                    )
                                  }
                                  className={`w-full border border-dashed p-3 text-left transition ${
                                    couponCode ===
                                    code
                                      ? "border-black bg-gray-50"
                                      : "border-gray-300 hover:border-black hover:bg-gray-50"
                                  }`}
                                >

                                  <div className="flex items-center justify-between gap-3">

                                    <div>

                                      <p className="text-sm font-semibold">
                                        {
                                          code
                                        }
                                      </p>

                                      <p className="mt-1 text-xs text-gray-500">
                                        {
                                          description
                                        }
                                      </p>

                                      {Number(
                                        coupon.minimumOrder ||
                                          0
                                      ) > 0 && (
                                        <p className="mt-1 text-[11px] text-gray-400">
                                          Min. order ₹
                                          {Number(
                                            coupon.minimumOrder
                                          ).toLocaleString(
                                            "en-IN"
                                          )}
                                        </p>
                                      )}

                                    </div>

                                    <span className="flex-shrink-0 text-xs font-medium">
                                      {
                                        discountText
                                      }
                                    </span>

                                  </div>

                                </button>
                              );
                            }
                          )}

                        {availableCoupons.filter(
                          (coupon) => {
                            if (
                              coupon.isActive ===
                              false
                            ) {
                              return false;
                            }

                            if (
                              coupon.expiryDate
                            ) {
                              const expiry =
                                new Date(
                                  `${coupon.expiryDate}T23:59:59`
                                );

                              if (
                                !Number.isNaN(
                                  expiry.getTime()
                                ) &&
                                new Date() >
                                  expiry
                              ) {
                                return false;
                              }
                            }

                            const usageLimit =
                              coupon.usageLimit ===
                                "" ||
                              coupon.usageLimit ===
                                null ||
                              coupon.usageLimit ===
                                undefined
                                ? null
                                : Number(
                                    coupon.usageLimit
                                  );

                            const usageCount =
                              Number(
                                coupon.usageCount ||
                                  0
                              );

                            return !(
                              usageLimit !==
                                null &&
                              !Number.isNaN(
                                usageLimit
                              ) &&
                              usageCount >=
                                usageLimit
                            );
                          }
                        ).length === 0 && (
                          <p className="border border-dashed border-gray-300 p-3 text-xs text-gray-500">
                            No active coupons available right now.
                          </p>
                        )}

                      </div>

                    </div>

                    {/* ================= COUPON INPUT ================= */}

                    <div className="flex gap-2">

                      <input
                        type="text"
                        value={
                          couponCode
                        }
                        onChange={(
                          event
                        ) => {
                          setCouponCode(
                            event.target.value.toUpperCase()
                          );

                          setCouponMessage(
                            ""
                          );

                          setCouponError(
                            ""
                          );
                        }}
                        onKeyDown={(
                          event
                        ) => {
                          if (
                            event.key ===
                            "Enter"
                          ) {
                            event.preventDefault();

                            handleApplyCoupon();
                          }
                        }}
                        placeholder="Enter coupon code"
                        className="min-w-0 flex-1 border px-3 py-3 text-sm uppercase outline-none focus:border-black"
                      />

                      <button
                        type="button"
                        onClick={
                          handleApplyCoupon
                        }
                        className="border border-black px-4 py-3 text-sm font-medium transition hover:bg-black hover:text-white"
                      >
                        Apply
                      </button>

                    </div>

                  </>
                )}

                {/* ================= APPLIED COUPON ================= */}

                {appliedCoupon && (

                  <div className="flex items-center justify-between border border-green-200 bg-green-50 p-3">

                    <div>

                      <p className="text-sm font-semibold text-green-700">
                        {
                          appliedCoupon.code
                        }
                      </p>

                      <p className="mt-1 text-xs text-green-600">
                        Coupon applied successfully
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        handleRemoveCoupon
                      }
                      className="text-xs font-medium text-red-600 underline"
                    >
                      Remove
                    </button>

                  </div>

                )}

                {couponMessage && (
                  <p className="mt-2 text-xs text-green-600">
                    {
                      couponMessage
                    }
                  </p>
                )}

                {couponError && (
                  <p className="mt-2 text-xs text-red-600">
                    {
                      couponError
                    }
                  </p>
                )}

              </div>

              <div className="my-6 border-t" />

              {/* ================= PRICE SUMMARY ================= */}

              <div className="space-y-4 text-sm">

                <div className="flex justify-between">

                  <span className="text-gray-500">
                    Items
                  </span>

                  <span>
                    {
                      totalItems
                    }
                  </span>

                </div>

                <div className="flex justify-between">

                  <span className="text-gray-500">
                    Subtotal
                  </span>

                  <span>
                    ₹
                    {cartTotal.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

                {discountAmount > 0 && (

                  <div className="flex justify-between">

                    <span className="text-green-600">
                      Discount
                    </span>

                    <span className="font-medium text-green-600">
                      -₹
                      {discountAmount.toLocaleString(
                        "en-IN"
                      )}
                    </span>

                  </div>

                )}

                <div className="flex justify-between">

                  <span className="text-gray-500">
                    Shipping
                  </span>

                  <span className="text-green-600">
                    FREE
                  </span>

                </div>

              </div>

              <div className="my-6 border-t" />

              {/* ================= FINAL TOTAL ================= */}

              <div className="flex items-center justify-between">

                <span className="font-semibold">
                  Total
                </span>

                <div className="text-right">

                  {discountAmount > 0 && (
                    <p className="text-sm text-gray-400 line-through">
                      ₹
                      {cartTotal.toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  )}

                  <span className="text-xl font-semibold">
                    ₹
                    {finalTotal.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

              </div>

              {inventoryError && (
                <p className="mt-3 text-center text-xs text-red-600">
                  {inventoryError}
                </p>
              )}

              <button
                type="submit"
                form="checkout-form"
                className="mt-6 w-full bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Place Order
              </button>

              <p className="mt-4 text-center text-xs text-gray-500">
                Your information is securely handled.
              </p>

            </aside>

          </form>

        </div>

      </div>

      {/* ================= CLOSE CONFIRMATION ================= */}

      {showCloseConfirmation && (

        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md bg-white p-6 shadow-2xl sm:p-8">

            <h3 className="text-xl font-semibold">
              Leave checkout?
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Your checkout information has not been submitted yet.
              Are you sure you want to leave?
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={
                  stayOnCheckout
                }
                className="border border-black px-5 py-3 text-sm font-medium"
              >
                Stay on Checkout
              </button>

              <button
                type="button"
                onClick={
                  leaveCheckout
                }
                className="bg-black px-5 py-3 text-sm font-medium text-white"
              >
                Leave Checkout
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}