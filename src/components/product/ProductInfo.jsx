"use client";

import {
  useEffect,
  useState,
} from "react";

import { useCart } from "@/context/CartContext";

import QuantitySelector from "./QuantitySelector";

export default function ProductInfo({
  product,
}) {
  const {
    addToCart,
    cartItems,
    getAvailableStock,
  } = useCart();

  const [quantity, setQuantity] =
    useState(1);

  const [
    selectedSize,
    setSelectedSize,
  ] = useState(
    product.sizes?.[0] || ""
  );

  const [stockQuantity, setStockQuantity] =
    useState(0);

  const [cartMessage, setCartMessage] =
    useState("");

  // =====================================================
  // LOAD STOCK
  // =====================================================

  useEffect(() => {
    const loadStock = () => {
      const stock =
        getAvailableStock(product);

      setStockQuantity(stock);
    };

    loadStock();

    const handleStorageChange = (
      event
    ) => {
      if (
        event.key ===
        "adminInventory"
      ) {
        loadStock();
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
  }, [
    product,
    getAvailableStock,
  ]);

  // =====================================================
  // CURRENT CART QUANTITY
  // Used internally only for stock validation
  // =====================================================

  const cartItem = cartItems.find(
    (item) =>
      item.id === product.id
  );

  const cartQuantity = cartItem
    ? Number(cartItem.quantity) || 0
    : 0;

  // =====================================================
  // REMAINING STOCK
  // =====================================================

  const remainingStock =
    Math.max(
      0,
      stockQuantity -
        cartQuantity
    );

  // =====================================================
  // STOCK STATUS
  // =====================================================

  const isOutOfStock =
    stockQuantity <= 0;

  const isCartFull =
    remainingStock <= 0;

  const isLowStock =
    stockQuantity > 0 &&
    stockQuantity <= 5;

  const requestedExceedsStock =
    quantity > remainingStock;

  // =====================================================
  // ADD BUTTON DISABLED
  // =====================================================

  const disableAddToCart =
    isOutOfStock ||
    isCartFull ||
    requestedExceedsStock;

  // =====================================================
  // QUANTITY CHANGE
  // =====================================================

  const handleQuantityChange = (
    newQuantity
  ) => {
    if (isOutOfStock) {
      setQuantity(1);
      return;
    }

    const numericQuantity =
      Number(newQuantity);

    if (
      Number.isNaN(
        numericQuantity
      )
    ) {
      return;
    }

    const safeQuantity =
      Math.max(
        1,
        numericQuantity
      );

    /*
      We allow the selector to reach
      the product stock amount.

      If the selected quantity is more
      than the remaining stock after
      considering the cart, the Add
      to Cart button becomes disabled.
    */

    setQuantity(
      Math.min(
        safeQuantity,
        stockQuantity
      )
    );

    setCartMessage("");
  };

  // =====================================================
  // DISCOUNT
  // =====================================================

  const discountPercentage =
    product.oldPrice
      ? Math.round(
          ((product.oldPrice -
            product.price) /
            product.oldPrice) *
            100
        )
      : 0;

  // =====================================================
  // ADD TO CART
  // =====================================================

  const handleAddToCart = () => {
    setCartMessage("");

    if (isOutOfStock) {
      setCartMessage(
        "This product is currently out of stock."
      );

      return;
    }

    if (isCartFull) {
      setCartMessage(
        "You've reached the maximum available stock."
      );

      return;
    }

    if (
      quantity >
      remainingStock
    ) {
      setCartMessage(
        `Only ${remainingStock} ${
          remainingStock === 1
            ? "item"
            : "items"
        } available.`
      );

      return;
    }

    const result =
      addToCart(
        product,
        quantity
      );

    if (!result.added) {
      const latestRemaining =
        Math.max(
          0,
          result.availableStock -
            cartQuantity
        );

      if (
        latestRemaining <=
        0
      ) {
        setCartMessage(
          "You've reached the maximum available stock."
        );
      } else {
        setCartMessage(
          `Only ${latestRemaining} ${
            latestRemaining === 1
              ? "item"
              : "items"
          } available.`
        );
      }

      return;
    }

    setCartMessage(
      "Product added to cart successfully."
    );

    setQuantity(1);
  };

  // =====================================================
  // BUY NOW
  // =====================================================

  const handleBuyNow = () => {
    if (
      isOutOfStock ||
      isCartFull ||
      requestedExceedsStock
    ) {
      return;
    }

    console.log(
      "Buy Now:",
      product.name,
      quantity
    );
  };

  return (
    <div>

      {/* =================================================
          CATEGORY
      ================================================= */}

      <p className="text-sm uppercase tracking-widest text-gray-500">
        {product.category ||
          "Jewellery"}
      </p>

      {/* =================================================
          PRODUCT NAME
      ================================================= */}

      <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
        {product.name}
      </h1>

      {/* =================================================
          RATING
      ================================================= */}

      <div className="mt-4 flex items-center gap-2 text-sm">

        <span className="text-yellow-500">
          ★
        </span>

        <span className="font-medium">
          {product.rating || 0}
        </span>

        <span className="text-gray-500">
          ({product.reviews || 0} Reviews)
        </span>

      </div>

      {/* =================================================
          PRICE
      ================================================= */}

      <div className="mt-6 flex flex-wrap items-center gap-3">

        <span className="text-2xl font-semibold">
          ₹{product.price}
        </span>

        {product.oldPrice && (
          <span className="text-lg text-gray-400 line-through">
            ₹{product.oldPrice}
          </span>
        )}

        {discountPercentage >
          0 && (
          <span className="font-medium text-green-600">
            {discountPercentage}% OFF
          </span>
        )}

      </div>

      <p className="mt-2 text-sm text-gray-500">
        Inclusive of all taxes
      </p>

      {/* =================================================
          STOCK STATUS
      ================================================= */}

      <div className="mt-5">

        {isOutOfStock && (
          <div className="flex items-center gap-2">

            <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>

            <span className="text-sm font-medium text-red-600">
              Out of Stock
            </span>

          </div>
        )}

        {!isOutOfStock &&
          isLowStock && (
            <div className="flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>

              <span className="text-sm font-medium text-yellow-600">
                Only {stockQuantity} left in stock
              </span>

            </div>
          )}

        {!isOutOfStock &&
          !isLowStock && (
            <div className="flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>

              <span className="text-sm font-medium text-green-600">
                In Stock
              </span>

            </div>
          )}

      </div>

      {/* =================================================
          OFFER
      ================================================= */}

      {product.offer && (
        <div className="mt-6 border border-gray-200 p-4">

          <p className="text-sm font-semibold">
            🎁 {product.offer}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Offer automatically applied at checkout.
          </p>

        </div>
      )}

      {/* =================================================
          SIZE
      ================================================= */}

      {product.sizes?.length >
        0 && (
        <div className="mt-7">

          <p className="mb-3 text-sm font-medium">
            Size
          </p>

          <div className="flex flex-wrap gap-2">

            {product.sizes.map(
              (size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    setSelectedSize(
                      size
                    )
                  }
                  disabled={
                    isOutOfStock
                  }
                  className={`border px-4 py-2 text-sm ${
                    selectedSize ===
                    size
                      ? "border-black bg-black text-white"
                      : "border-gray-300"
                  } ${
                    isOutOfStock
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  {size}
                </button>
              )
            )}

          </div>

        </div>
      )}

      {/* =================================================
          QUANTITY
      ================================================= */}

      <div className="mt-7">

        <QuantitySelector
          quantity={quantity}
          setQuantity={
            handleQuantityChange
          }
        />

      </div>

      {/* =================================================
          STOCK VALIDATION MESSAGE
      ================================================= */}

      {requestedExceedsStock &&
        !isOutOfStock &&
        !isCartFull && (
          <div className="mt-3 border border-yellow-200 bg-yellow-50 px-4 py-3">

            <p className="text-sm font-medium text-yellow-700">
              Only {remainingStock}{" "}
              {remainingStock === 1
                ? "item"
                : "items"}{" "}
              available.
            </p>

          </div>
        )}

      {isCartFull &&
        !isOutOfStock && (
          <div className="mt-3 border border-yellow-200 bg-yellow-50 px-4 py-3">

            <p className="text-sm font-medium text-yellow-700">
              You've reached the maximum available stock.
            </p>

          </div>
        )}

      {cartMessage && (
        <div
          className={`mt-3 px-4 py-3 text-sm ${
            cartMessage.includes(
              "successfully"
            )
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-600"
          }`}
        >
          {cartMessage}
        </div>
      )}

      {/* =================================================
          BUTTONS
      ================================================= */}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">

        {/* ADD TO CART */}

        <button
          type="button"
          onClick={
            handleAddToCart
          }
          disabled={
            disableAddToCart
          }
          className={`flex-1 px-6 py-4 font-medium transition ${
            disableAddToCart
              ? "cursor-not-allowed bg-gray-200 text-gray-400"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {isOutOfStock
            ? "Out of Stock"
            : "Add to Cart"}
        </button>

        {/* BUY NOW */}

        <button
          type="button"
          onClick={
            handleBuyNow
          }
          disabled={
            isOutOfStock ||
            isCartFull ||
            requestedExceedsStock
          }
          className={`flex-1 border px-6 py-4 font-medium transition ${
            isOutOfStock ||
            isCartFull ||
            requestedExceedsStock
              ? "cursor-not-allowed border-gray-200 text-gray-400"
              : "border-black hover:bg-black hover:text-white"
          }`}
        >
          Buy Now
        </button>

      </div>

    </div>
  );
}