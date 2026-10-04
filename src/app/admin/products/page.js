"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import products from "@/data/products";

export default function AdminProductsPage() {
  // ================= STATES =================

  const [productList, setProductList] = useState([]);
  const [inventory, setInventory] = useState({});
  const [isLoaded, setIsLoaded] = useState(false);

  // ================= FILTER STATES =================

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // ================= FORM STATES =================

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "Earrings",
    price: "",
    oldPrice: "",
    discount: "",
    image: "",
    hoverImage: "",
    color: "",
    material: "",
    gender: "Women",
    occasion: "Everyday",

    inStock: true,

    isNew: false,
    isBestSeller: false,
    isRegular: true,
  });

  const [formError, setFormError] = useState("");
  const [imageError, setImageError] = useState("");
  const [hoverImageError, setHoverImageError] = useState("");

  // ================= IMAGE CONSTANTS =================

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  // ================= LOAD PRODUCTS + INVENTORY =================

  useEffect(() => {
    try {
      const savedProducts =
        localStorage.getItem("adminProducts");

      const savedInventory =
        localStorage.getItem("adminInventory");

      // ================= LOAD PRODUCTS =================

      if (savedProducts) {
        setProductList(JSON.parse(savedProducts));
      } else {
        setProductList(products);

        localStorage.setItem(
          "adminProducts",
          JSON.stringify(products)
        );
      }

      // ================= LOAD INVENTORY =================

      if (savedInventory) {
        setInventory(JSON.parse(savedInventory));
      } else {
        const initialInventory = {};

        const productData = savedProducts
          ? JSON.parse(savedProducts)
          : products;

        productData.forEach((product) => {
          initialInventory[String(product.id)] =
            product.inStock ? 10 : 0;
        });

        setInventory(initialInventory);

        localStorage.setItem(
          "adminInventory",
          JSON.stringify(initialInventory)
        );
      }
    } catch (error) {
      console.error(
        "Failed to load products and inventory:",
        error
      );

      setProductList(products);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // ================= REFRESH INVENTORY =================

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key !== "adminInventory") {
        return;
      }

      try {
        const updatedInventory =
          event.newValue
            ? JSON.parse(event.newValue)
            : {};

        setInventory(updatedInventory);
      } catch (error) {
        console.error(
          "Failed to refresh inventory:",
          error
        );
      }
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
  }, []);

  // ================= SAVE PRODUCTS =================

  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem(
        "adminProducts",
        JSON.stringify(productList)
      );
    } catch (error) {
      console.error(
        "Failed to save products:",
        error
      );
    }
  }, [productList, isLoaded]);

  // ================= CATEGORIES =================

  const categories = [
    "All",
    ...new Set(
      productList.map(
        (product) => product.category
      )
    ),
  ];

  // ================= FILTER PRODUCTS =================

  const filteredProducts = useMemo(() => {
    return productList.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        category === "All" ||
        product.category === category;

      // Read actual quantity from inventory
      const quantity = Number(
        inventory[String(product.id)] ?? 0
      );

      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "In Stock" &&
          quantity > 0) ||
        (stockFilter === "Out of Stock" &&
          quantity === 0);

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "New" &&
          product.isNew) ||
        (statusFilter === "Best Seller" &&
          product.isBestSeller) ||
        (statusFilter === "Regular" &&
          (
            product.isRegular === true ||
            (
              !product.isNew &&
              !product.isBestSeller
            )
          ));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock &&
        matchesStatus
      );
    });
  }, [
    productList,
    inventory,
    search,
    category,
    stockFilter,
    statusFilter,
  ]);

  // ================= DISCOUNT CALCULATION =================

  const priceNumber =
    Number(form.price) || 0;

  const discountNumber = Math.min(
    Number(form.discount) || 0,
    100
  );

  const discountAmount =
    priceNumber > 0
      ? (priceNumber * discountNumber) / 100
      : 0;

  const priceAfterDiscount =
    priceNumber > 0
      ? Math.max(
          0,
          priceNumber - discountAmount
        )
      : 0;

  // ================= FORM CHANGE =================

  const handleFormChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    // ================= PRICE =================

    if (name === "price") {
      const numericValue = value
        .replace(/\D/g, "")
        .slice(0, 6);

      setForm((currentForm) => ({
        ...currentForm,
        price: numericValue,
      }));

      setFormError("");
      return;
    }

    // ================= OLD PRICE =================

    if (name === "oldPrice") {
      const numericValue = value
        .replace(/\D/g, "")
        .slice(0, 6);

      setForm((currentForm) => ({
        ...currentForm,
        oldPrice: numericValue,
      }));

      setFormError("");
      return;
    }

    // ================= DISCOUNT =================

    if (name === "discount") {
      const numericValue = value
        .replace(/\D/g, "")
        .slice(0, 3);

      const discountValue =
        numericValue === ""
          ? ""
          : Math.min(
              Number(numericValue),
              100
            ).toString();

      setForm((currentForm) => ({
        ...currentForm,
        discount: discountValue,
      }));

      setFormError("");
      return;
    }

    // ================= PRODUCT STATUS =================
    // All three are independent checkboxes.
    // New + Best Seller + Regular can all be selected together.

    if (
      name === "isRegular" ||
      name === "isNew" ||
      name === "isBestSeller"
    ) {
      setForm((currentForm) => ({
        ...currentForm,
        [name]: checked,
      }));

      setFormError("");
      return;
    }

    // ================= OTHER FIELDS =================

    setForm((currentForm) => ({
      ...currentForm,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setFormError("");
  };

  // ================= IMAGE UPLOAD =================

  const convertImageToBase64 = (
    file,
    fieldName
  ) => {
    if (!file) return;

    setFormError("");

    if (!allowedImageTypes.includes(file.type)) {
      const message =
        "Only JPG, JPEG, PNG and WEBP images are allowed.";

      if (fieldName === "image") {
        setImageError(message);
      } else {
        setHoverImageError(message);
      }

      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      const message =
        "Image size must be less than 5 MB.";

      if (fieldName === "image") {
        setImageError(message);
      } else {
        setHoverImageError(message);
      }

      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((currentForm) => ({
        ...currentForm,
        [fieldName]: reader.result,
      }));

      if (fieldName === "image") {
        setImageError("");
      } else {
        setHoverImageError("");
      }
    };

    reader.onerror = () => {
      const message =
        "Failed to read the selected image.";

      if (fieldName === "image") {
        setImageError(message);
      } else {
        setHoverImageError(message);
      }
    };

    reader.readAsDataURL(file);
  };

  // ================= FILE INPUT =================

  const handleImageChange = (
    event,
    fieldName
  ) => {
    const file =
      event.target.files?.[0];

    if (file) {
      convertImageToBase64(
        file,
        fieldName
      );
    }

    event.target.value = "";
  };

  // ================= DROP IMAGE =================

  const handleImageDrop = (
    event,
    fieldName
  ) => {
    event.preventDefault();

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      convertImageToBase64(
        file,
        fieldName
      );
    }
  };

  // ================= RESET FORM =================

  const resetForm = () => {
    setForm({
      name: "",
      category: "Earrings",
      price: "",
      oldPrice: "",
      discount: "",
      image: "",
      hoverImage: "",
      color: "",
      material: "",
      gender: "Women",
      occasion: "Everyday",

      inStock: true,

      isNew: false,
      isBestSeller: false,
      isRegular: true,
    });

    setEditingProductId(null);
    setFormError("");
    setImageError("");
    setHoverImageError("");
  };

  // ================= OPEN ADD FORM =================

  const handleOpenAddForm = () => {
    resetForm();
    setShowAddForm(true);
  };

  // ================= OPEN EDIT FORM =================

  const handleEditProduct = (product) => {
    setForm({
      name: product.name || "",

      category:
        product.category || "Earrings",

      price:
        product.price !== undefined
          ? String(product.price)
          : "",

      oldPrice:
        product.oldPrice !== undefined
          ? String(product.oldPrice)
          : "",

      discount:
        product.discount !== undefined
          ? String(product.discount)
          : "",

      image: product.image || "",

      hoverImage:
        product.hoverImage || "",

      color: product.color || "",

      material:
        product.material || "",

      gender:
        product.gender || "Women",

      occasion:
        product.occasion ||
        "Everyday",

      inStock:
        product.inStock !== undefined
          ? product.inStock
          : true,

      isNew: Boolean(
        product.isNew
      ),

      isBestSeller: Boolean(
        product.isBestSeller
      ),

      isRegular:
        product.isRegular !== undefined
          ? Boolean(product.isRegular)
          : !product.isNew &&
            !product.isBestSeller,
    });

    setEditingProductId(
      product.id
    );

    setFormError("");
    setImageError("");
    setHoverImageError("");
    setShowAddForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ================= DELETE PRODUCT =================

  const handleDeleteProduct = (
    product
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.name}"?`
      );

    if (!confirmed) return;

    setProductList(
      (currentProducts) =>
        currentProducts.filter(
          (item) =>
            item.id !== product.id
        )
    );

    // Remove inventory for deleted product
    setInventory(
      (currentInventory) => {
        const updatedInventory = {
          ...currentInventory,
        };

        delete updatedInventory[
          String(product.id)
        ];

        localStorage.setItem(
          "adminInventory",
          JSON.stringify(
            updatedInventory
          )
        );

        return updatedInventory;
      }
    );
  };

  // ================= VALIDATE FORM =================

  const validateForm = () => {
    setFormError("");

    // PRODUCT NAME

    if (!form.name.trim()) {
      setFormError(
        "Please enter the product name."
      );

      return false;
    }

    if (
      form.name.trim().length < 3
    ) {
      setFormError(
        "Product name must contain at least 3 characters."
      );

      return false;
    }

    // PRICE

    if (!form.price) {
      setFormError(
        "Please enter the product price."
      );

      return false;
    }

    if (
      !/^\d{1,6}$/.test(
        form.price
      )
    ) {
      setFormError(
        "Price must contain maximum 6 digits."
      );

      return false;
    }

    if (
      Number(form.price) <= 0
    ) {
      setFormError(
        "Price must be greater than 0."
      );

      return false;
    }

    // OLD PRICE

    if (form.oldPrice) {
      if (
        !/^\d{1,6}$/.test(
          form.oldPrice
        )
      ) {
        setFormError(
          "Old price must contain maximum 6 digits."
        );

        return false;
      }

      if (
        Number(form.oldPrice) <=
        Number(form.price)
      ) {
        setFormError(
          "Old price must be greater than the selling price."
        );

        return false;
      }
    }

    // DISCOUNT

    if (form.discount) {
      if (
        !/^\d{1,3}$/.test(
          form.discount
        )
      ) {
        setFormError(
          "Discount must be between 0% and 100%."
        );

        return false;
      }

      if (
        Number(form.discount) < 0 ||
        Number(form.discount) > 100
      ) {
        setFormError(
          "Discount must be between 0% and 100%."
        );

        return false;
      }
    }

    // PRODUCT IMAGE

    if (!form.image) {
      setImageError(
        "Please upload the product image."
      );

      return false;
    }

    // HOVER IMAGE

    if (!form.hoverImage) {
      setHoverImageError(
        "Please upload the hover image."
      );

      return false;
    }

    // COLOR

    if (!form.color.trim()) {
      setFormError(
        "Please enter the product color."
      );

      return false;
    }

    // MATERIAL

    if (!form.material.trim()) {
      setFormError(
        "Please enter the product material."
      );

      return false;
    }

    return true;
  };

  // ================= ADD / UPDATE PRODUCT =================

  const handleSaveProduct = (
    event
  ) => {
    event.preventDefault();

    const isValid =
      validateForm();

    if (!isValid) return;

    const productData = {
      name: form.name.trim(),

      category: form.category,

      price: Number(form.price),

      oldPrice: form.oldPrice
        ? Number(form.oldPrice)
        : undefined,

      discount:
        Number(form.discount) || 0,

      discountAmount:
        Number(
          discountAmount.toFixed(2)
        ),

      priceAfterDiscount:
        Number(
          priceAfterDiscount.toFixed(
            2
          )
        ),

      image: form.image,

      hoverImage:
        form.hoverImage,

      color: form.color.trim(),

      material:
        form.material.trim(),

      gender: form.gender,

      occasion:
        form.occasion,

      inStock:
        form.inStock,

      // Independent product statuses
      isNew:
        form.isNew,

      isBestSeller:
        form.isBestSeller,

      isRegular:
        form.isRegular,
    };

    // ================= UPDATE =================

    if (
      editingProductId !== null
    ) {
      setProductList(
        (currentProducts) =>
          currentProducts.map(
            (product) =>
              product.id ===
              editingProductId
                ? {
                    ...product,
                    ...productData,
                  }
                : product
          )
      );
    }

    // ================= ADD =================

    else {
      const newProduct = {
        id:
          productList.length > 0
            ? Math.max(
                ...productList.map(
                  (product) =>
                    Number(
                      product.id
                    )
                )
              ) + 1
            : 1,

        ...productData,

        rating: 0,

        reviews: 0,
      };

      setProductList(
        (currentProducts) => [
          ...currentProducts,
          newProduct,
        ]
      );
    }

    resetForm();
    setShowAddForm(false);
  };

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ================= HEADER ================= */}

      <div className="border-b bg-white">

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

            <div>

              <Link
                href="/admin"
                className="text-xs text-gray-500 hover:text-black"
              >
                ← Back to Dashboard
              </Link>

              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-gray-500">
                Store Management
              </p>

              <h1 className="mt-1 text-2xl font-semibold">
                Products
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage your jewellery products.
              </p>

            </div>

            <button
              type="button"
              onClick={
                handleOpenAddForm
              }
              className="bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              + Add Product
            </button>

          </div>

        </div>

      </div>

      {/* ================= CONTENT ================= */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ================= ADD / EDIT FORM ================= */}

        {showAddForm && (

          <div className="mb-8 border border-gray-200 bg-white">

            {/* FORM HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-5">

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Product Management
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {editingProductId !== null
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

              </div>

              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
                className="text-2xl text-gray-400 hover:text-black"
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleSaveProduct
              }
              className="p-6"
            >

              {/* ================= BASIC INFORMATION ================= */}

              <div>

                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Basic Information
                </h3>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

                  {/* NAME */}

                  <div className="md:col-span-2">

                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium"
                    >
                      Product Name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={
                        handleFormChange
                      }
                      placeholder="Enter product name"
                      maxLength={100}
                      className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                    />

                    <p className="mt-1 text-xs text-gray-400">
                      Minimum 3 characters
                    </p>

                  </div>

                  {/* CATEGORY */}

                  <div>

                    <label
                      htmlFor="productCategory"
                      className="mb-2 block text-sm font-medium"
                    >
                      Category
                    </label>

                    <select
                      id="productCategory"
                      name="category"
                      value={
                        form.category
                      }
                      onChange={
                        handleFormChange
                      }
                      className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                    >
                      <option value="Earrings">
                        Earrings
                      </option>

                      <option value="Necklaces">
                        Necklaces
                      </option>

                      <option value="Bracelets">
                        Bracelets
                      </option>

                      <option value="Rings">
                        Rings
                      </option>

                      <option value="Bangles">
                        Bangles
                      </option>

                    </select>

                  </div>

                  {/* COLOR */}

                  <div>

                    <label
                      htmlFor="color"
                      className="mb-2 block text-sm font-medium"
                    >
                      Color
                    </label>

                    <input
                      id="color"
                      name="color"
                      type="text"
                      value={form.color}
                      onChange={
                        handleFormChange
                      }
                      placeholder="e.g. Gold"
                      maxLength={50}
                      className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                    />

                  </div>

                  {/* MATERIAL */}

                  <div>

                    <label
                      htmlFor="material"
                      className="mb-2 block text-sm font-medium"
                    >
                      Material
                    </label>

                    <input
                      id="material"
                      name="material"
                      type="text"
                      value={
                        form.material
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="e.g. Gold Plated"
                      maxLength={50}
                      className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
                    />

                  </div>

                  {/* GENDER */}

                  <div>

                    <label
                      htmlFor="gender"
                      className="mb-2 block text-sm font-medium"
                    >
                      Gender
                    </label>

                    <select
                      id="gender"
                      name="gender"
                      value={
                        form.gender
                      }
                      onChange={
                        handleFormChange
                      }
                      className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                    >
                      <option value="Women">
                        Women
                      </option>

                      <option value="Men">
                        Men
                      </option>

                      <option value="Unisex">
                        Unisex
                      </option>

                    </select>

                  </div>

                  {/* OCCASION */}

                  <div>

                    <label
                      htmlFor="occasion"
                      className="mb-2 block text-sm font-medium"
                    >
                      Occasion
                    </label>

                    <select
                      id="occasion"
                      name="occasion"
                      value={
                        form.occasion
                      }
                      onChange={
                        handleFormChange
                      }
                      className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
                    >
                      <option value="Everyday">
                        Everyday
                      </option>

                      <option value="Festive">
                        Festive
                      </option>

                      <option value="Wedding">
                        Wedding
                      </option>

                      <option value="Party">
                        Party
                      </option>

                    </select>

                  </div>

                </div>

              </div>

              {/* ================= PRICING ================= */}

              <div className="mt-8 border-t pt-8">

                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Pricing
                </h3>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">

                  {/* SELLING PRICE */}

                  <div>

                    <label
                      htmlFor="price"
                      className="mb-2 block text-sm font-medium"
                    >
                      Selling Price
                    </label>

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        ₹
                      </span>

                      <input
                        id="price"
                        name="price"
                        type="text"
                        inputMode="numeric"
                        value={
                          form.price
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Enter price"
                        maxLength={6}
                        className="w-full border border-gray-300 py-3 pl-9 pr-4 text-sm outline-none focus:border-black"
                      />

                    </div>

                    <p className="mt-1 text-xs text-gray-400">
                      Maximum 6 digits
                    </p>

                  </div>

                  {/* OLD PRICE */}

                  <div>

                    <label
                      htmlFor="oldPrice"
                      className="mb-2 block text-sm font-medium"
                    >
                      Old Price
                    </label>

                    <div className="relative">

                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        ₹
                      </span>

                      <input
                        id="oldPrice"
                        name="oldPrice"
                        type="text"
                        inputMode="numeric"
                        value={
                          form.oldPrice
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Enter old price"
                        maxLength={6}
                        className="w-full border border-gray-300 py-3 pl-9 pr-4 text-sm outline-none focus:border-black"
                      />

                    </div>

                    <p className="mt-1 text-xs text-gray-400">
                      Must be greater than selling price
                    </p>

                  </div>

                  {/* DISCOUNT */}

                  <div>

                    <label
                      htmlFor="discount"
                      className="mb-2 block text-sm font-medium"
                    >
                      Discount
                    </label>

                    <div className="relative">

                      <input
                        id="discount"
                        name="discount"
                        type="text"
                        inputMode="numeric"
                        value={
                          form.discount
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Enter discount"
                        maxLength={3}
                        className="w-full border border-gray-300 px-4 py-3 pr-10 text-sm outline-none focus:border-black"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        %
                      </span>

                    </div>

                    <p className="mt-1 text-xs text-gray-400">
                      0% to 100%
                    </p>

                  </div>

                </div>

                {/* ADMIN PRICE PREVIEW */}

                <div className="mt-6 border border-gray-200 bg-gray-50 p-5">

                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Admin Price Preview
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">

                    <div>

                      <p className="text-xs text-gray-500">
                        Selling Price
                      </p>

                      <p className="mt-1 text-lg font-medium">
                        ₹
                        {priceNumber.toFixed(
                          2
                        )}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Discount Amount
                      </p>

                      <p className="mt-1 text-lg font-medium">
                        ₹
                        {discountAmount.toFixed(
                          2
                        )}
                      </p>

                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Price After Discount
                      </p>

                      <p className="mt-1 text-xl font-semibold">
                        ₹
                        {priceAfterDiscount.toFixed(
                          2
                        )}
                      </p>

                    </div>

                  </div>

                  <p className="mt-4 text-xs text-gray-400">
                    This calculation is visible only to
                    the admin.
                  </p>

                </div>

              </div>

              {/* ================= IMAGES ================= */}

              <div className="mt-8 border-t pt-8">

                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Product Images
                </h3>

                <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">

                  {/* PRODUCT IMAGE */}

                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Product Image
                    </label>

                    <div
                      onDragOver={(event) =>
                        event.preventDefault()
                      }
                      onDrop={(event) =>
                        handleImageDrop(
                          event,
                          "image"
                        )
                      }
                      className={`border-2 border-dashed p-4 text-center ${
                        imageError
                          ? "border-red-400"
                          : "border-gray-300 hover:border-black"
                      }`}
                    >

                      {form.image ? (

                        <div>

                          <img
                            src={form.image}
                            alt="Product preview"
                            className="mx-auto h-52 w-full object-contain"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              setForm(
                                (
                                  currentForm
                                ) => ({
                                  ...currentForm,
                                  image: "",
                                })
                              );

                              setImageError(
                                ""
                              );
                            }}
                            className="mt-4 border border-gray-300 px-4 py-2 text-xs font-medium hover:border-red-600 hover:text-red-600"
                          >
                            Remove Image
                          </button>

                        </div>

                      ) : (

                        <label
                          htmlFor="productImageUpload"
                          className="flex min-h-52 cursor-pointer flex-col items-center justify-center"
                        >

                          <div className="text-4xl text-gray-300">
                            ↑
                          </div>

                          <p className="mt-3 text-sm font-medium">
                            Drag & Drop Image
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            or click to browse
                          </p>

                          <p className="mt-3 text-xs text-gray-400">
                            JPG, PNG, WEBP • Max 5 MB
                          </p>

                          <input
                            id="productImageUpload"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(event) =>
                              handleImageChange(
                                event,
                                "image"
                              )
                            }
                          />

                        </label>

                      )}

                    </div>

                    {imageError && (
                      <p className="mt-2 text-xs text-red-600">
                        {imageError}
                      </p>
                    )}

                  </div>

                  {/* HOVER IMAGE */}

                  <div>

                    <label className="mb-2 block text-sm font-medium">
                      Hover Image
                    </label>

                    <div
                      onDragOver={(event) =>
                        event.preventDefault()
                      }
                      onDrop={(event) =>
                        handleImageDrop(
                          event,
                          "hoverImage"
                        )
                      }
                      className={`border-2 border-dashed p-4 text-center ${
                        hoverImageError
                          ? "border-red-400"
                          : "border-gray-300 hover:border-black"
                      }`}
                    >

                      {form.hoverImage ? (

                        <div>

                          <img
                            src={
                              form.hoverImage
                            }
                            alt="Hover image preview"
                            className="mx-auto h-52 w-full object-contain"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              setForm(
                                (
                                  currentForm
                                ) => ({
                                  ...currentForm,
                                  hoverImage:
                                    "",
                                })
                              );

                              setHoverImageError(
                                ""
                              );
                            }}
                            className="mt-4 border border-gray-300 px-4 py-2 text-xs font-medium hover:border-red-600 hover:text-red-600"
                          >
                            Remove Image
                          </button>

                        </div>

                      ) : (

                        <label
                          htmlFor="hoverImageUpload"
                          className="flex min-h-52 cursor-pointer flex-col items-center justify-center"
                        >

                          <div className="text-4xl text-gray-300">
                            ↑
                          </div>

                          <p className="mt-3 text-sm font-medium">
                            Drag & Drop Image
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            or click to browse
                          </p>

                          <p className="mt-3 text-xs text-gray-400">
                            JPG, PNG, WEBP • Max 5 MB
                          </p>

                          <input
                            id="hoverImageUpload"
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                            className="hidden"
                            onChange={(event) =>
                              handleImageChange(
                                event,
                                "hoverImage"
                              )
                            }
                          />

                        </label>

                      )}

                    </div>

                    {hoverImageError && (
                      <p className="mt-2 text-xs text-red-600">
                        {hoverImageError}
                      </p>
                    )}

                  </div>

                </div>

              </div>

              {/* ================= STATUS ================= */}

              <div className="mt-8 border-t pt-8">

                <h3 className="text-sm font-semibold uppercase tracking-wider">
                  Product Status
                </h3>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  {/* IN STOCK */}

                  <label className="flex cursor-pointer items-center gap-3 text-sm">

                    <input
                      type="checkbox"
                      name="inStock"
                      checked={
                        form.inStock
                      }
                      onChange={
                        handleFormChange
                      }
                      className="h-4 w-4"
                    />

                    <span>
                      In Stock
                    </span>

                  </label>

                  {/* NEW PRODUCT */}

                  <label className="flex cursor-pointer items-center gap-3 text-sm">

                    <input
                      type="checkbox"
                      name="isNew"
                      checked={
                        form.isNew
                      }
                      onChange={
                        handleFormChange
                      }
                      className="h-4 w-4"
                    />

                    <span>
                      New Product
                    </span>

                  </label>

                  {/* BEST SELLER */}

                  <label className="flex cursor-pointer items-center gap-3 text-sm">

                    <input
                      type="checkbox"
                      name="isBestSeller"
                      checked={
                        form.isBestSeller
                      }
                      onChange={
                        handleFormChange
                      }
                      className="h-4 w-4"
                    />

                    <span>
                      Best Seller
                    </span>

                  </label>

                  {/* REGULAR PRODUCT */}

                  <label className="flex cursor-pointer items-center gap-3 text-sm">

                    <input
                      type="checkbox"
                      name="isRegular"
                      checked={
                        form.isRegular
                      }
                      onChange={
                        handleFormChange
                      }
                      className="h-4 w-4"
                    />

                    <span>
                      Regular Product
                    </span>

                  </label>

                </div>

              </div>

              {/* ================= ERROR ================= */}

              {(formError ||
                imageError ||
                hoverImageError) && (

                <div className="mt-6 border border-red-200 bg-red-50 px-4 py-3">

                  {formError && (
                    <p className="text-sm text-red-600">
                      {formError}
                    </p>
                  )}

                  {imageError && (
                    <p className="text-sm text-red-600">
                      {imageError}
                    </p>
                  )}

                  {hoverImageError && (
                    <p className="text-sm text-red-600">
                      {hoverImageError}
                    </p>
                  )}

                </div>

              )}

              {/* ================= BUTTONS ================= */}

              <div className="mt-8 flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddForm(false);
                  }}
                  className="border border-gray-300 px-6 py-3 text-sm font-medium transition hover:border-black"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  {editingProductId !== null
                    ? "Update Product"
                    : "Add Product"}
                </button>

              </div>

            </form>

          </div>

        )}

        {/* ================= FILTERS ================= */}

        <div className="mb-6 border border-gray-200 bg-white p-4">

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

            {/* SEARCH */}

            <div>

              <label
                htmlFor="productSearch"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Search
              </label>

              <input
                id="productSearch"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search products..."
                className="w-full border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
              />

            </div>

            {/* CATEGORY */}

            <div>

              <label
                htmlFor="categoryFilter"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Category
              </label>

              <select
                id="categoryFilter"
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              >

                {categories.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* STOCK */}

            <div>

              <label
                htmlFor="stockFilter"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Stock
              </label>

              <select
                id="stockFilter"
                value={stockFilter}
                onChange={(event) =>
                  setStockFilter(
                    event.target.value
                  )
                }
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              >

                <option value="All">
                  All
                </option>

                <option value="In Stock">
                  In Stock
                </option>

                <option value="Out of Stock">
                  Out of Stock
                </option>

              </select>

            </div>

            {/* STATUS */}

            <div>

              <label
                htmlFor="statusFilter"
                className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                Status
              </label>

              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-black"
              >

                <option value="All">
                  All
                </option>

                <option value="New">
                  New
                </option>

                <option value="Best Seller">
                  Best Seller
                </option>

                <option value="Regular">
                  Regular
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* ================= SUMMARY ================= */}

        <div className="mb-4">

          <p className="text-sm text-gray-500">

            Showing{" "}

            <span className="font-medium text-black">
              {filteredProducts.length}
            </span>{" "}

            of{" "}

            <span className="font-medium text-black">
              {productList.length}
            </span>{" "}

            products

          </p>

        </div>

        {/* ================= PRODUCT TABLE ================= */}

        <div className="overflow-hidden border border-gray-200 bg-white">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-left">

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Product
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Category
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Price
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Stock
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredProducts.map(
                  (product) => {

                    const quantity =
                      Number(
                        inventory[
                          String(
                            product.id
                          )
                        ] ?? 0
                      );

                    return (

                      <tr
                        key={product.id}
                        className="transition hover:bg-gray-50"
                      >

                        {/* PRODUCT */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-4">

                            <img
                              src={
                                product.image
                              }
                              alt={
                                product.name
                              }
                              className="h-16 w-16 object-cover"
                            />

                            <div>

                              <p className="font-medium">
                                {
                                  product.name
                                }
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
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
                            product.category
                          }
                        </td>

                        {/* PRICE */}

                        <td className="px-5 py-4">

                          <p className="text-sm font-medium">
                            ₹
                            {
                              product.price
                            }
                          </p>

                          {product.discount >
                            0 && (

                            <p className="mt-1 text-xs text-gray-500">
                              {
                                product.discount
                              }
                              % OFF
                            </p>

                          )}

                          {product.oldPrice && (

                            <p className="mt-1 text-xs text-gray-400 line-through">
                              ₹
                              {
                                product.oldPrice
                              }
                            </p>

                          )}

                        </td>

                        {/* STOCK */}

                        <td className="px-5 py-4 text-sm">

                          {quantity === 0 ? (

                            <div>

                              <p className="font-medium text-red-600">
                                0
                              </p>

                              <p className="mt-1 text-xs text-red-500">
                                Out of Stock
                              </p>

                            </div>

                          ) : quantity <= 5 ? (

                            <div>

                              <p className="font-medium text-yellow-600">
                                {quantity}
                              </p>

                              <p className="mt-1 text-xs text-yellow-600">
                                Low Stock
                              </p>

                            </div>

                          ) : (

                            <div>

                              <p className="font-medium text-gray-700">
                                {quantity}
                              </p>

                              <p className="mt-1 text-xs text-green-600">
                                In Stock
                              </p>

                            </div>

                          )}

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          {product.isNew && (

                            <span className="mr-2 inline-block border border-gray-300 px-2 py-1 text-xs">
                              New
                            </span>

                          )}

                          {product.isBestSeller && (

                            <span className="mr-2 inline-block border border-gray-300 px-2 py-1 text-xs">
                              Best Seller
                            </span>

                          )}

                          {product.isRegular && (

                            <span className="inline-block border border-gray-300 px-2 py-1 text-xs">
                              Regular
                            </span>

                          )}

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">

                          <div className="flex gap-2">

                            {/* EDIT */}

                            <button
                              type="button"
                              onClick={() =>
                                handleEditProduct(
                                  product
                                )
                              }
                              className="border border-gray-300 px-3 py-2 text-xs font-medium transition hover:border-black hover:bg-black hover:text-white"
                            >
                              Edit
                            </button>

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteProduct(
                                  product
                                )
                              }
                              className="border border-gray-300 px-3 py-2 text-xs font-medium text-red-600 transition hover:border-red-600 hover:bg-red-600 hover:text-white"
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

          {/* EMPTY STATE */}

          {filteredProducts.length ===
            0 && (

            <div className="px-6 py-16 text-center">

              <p className="font-medium">
                No products found
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or filters.
              </p>

            </div>

          )}

        </div>

      </div>

    </main>
  );
}