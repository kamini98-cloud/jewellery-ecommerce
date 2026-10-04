"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartLoaded, setIsCartLoaded] =
    useState(false);

  // =====================================================
  // LOAD CART
  // =====================================================

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem("cart");

      if (savedCart) {
        const parsedCart =
          JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      }
    } catch (error) {
      console.error(
        "Failed to load cart:",
        error
      );
    } finally {
      setIsCartLoaded(true);
    }
  }, []);

  // =====================================================
  // SAVE CART
  // =====================================================

  useEffect(() => {
    if (!isCartLoaded) return;

    try {
      localStorage.setItem(
        "cart",
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error(
        "Failed to save cart:",
        error
      );
    }
  }, [cartItems, isCartLoaded]);

  // =====================================================
  // GET CURRENT INVENTORY
  // =====================================================

  const getAvailableStock = (product) => {
    try {
      const savedInventory =
        localStorage.getItem(
          "adminInventory"
        );

      if (savedInventory) {
        const inventory =
          JSON.parse(savedInventory);

        const stock = Number(
          inventory[String(product.id)] ?? 0
        );

        return Math.max(0, stock);
      }

      // Fallback
      return product.inStock ? 10 : 0;
    } catch (error) {
      console.error(
        "Failed to read inventory:",
        error
      );

      return product.inStock ? 10 : 0;
    }
  };

  // =====================================================
  // ADD TO CART
  // =====================================================

  const addToCart = (
    product,
    quantity = 1
  ) => {
    const requestedQuantity =
      Math.max(
        1,
        Number(quantity) || 1
      );

    const availableStock =
      getAvailableStock(product);

    let added = false;

    setCartItems((currentItems) => {
      const existingItem =
        currentItems.find(
          (item) =>
            item.id === product.id
        );

      const existingQuantity =
        existingItem
          ? Number(
              existingItem.quantity
            )
          : 0;

      const totalRequested =
        existingQuantity +
        requestedQuantity;

      // =================================================
      // STOCK LIMIT
      // =================================================

      if (
        availableStock <= 0 ||
        totalRequested > availableStock
      ) {
        added = false;
        return currentItems;
      }

      added = true;

      // =================================================
      // UPDATE EXISTING ITEM
      // =================================================

      if (existingItem) {
        return currentItems.map(
          (item) =>
            item.id === product.id
              ? {
                  ...item,
                  quantity:
                    existingQuantity +
                    requestedQuantity,
                }
              : item
        );
      }

      // =================================================
      // ADD NEW ITEM
      // =================================================

      return [
        ...currentItems,
        {
          ...product,
          quantity:
            requestedQuantity,
        },
      ];
    });

    return {
      added,
      availableStock,
    };
  };

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  const removeFromCart = (
    productId
  ) => {
    setCartItems(
      (currentItems) =>
        currentItems.filter(
          (item) =>
            item.id !== productId
        )
    );
  };

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  const increaseQuantity = (
    productId
  ) => {
    setCartItems((currentItems) => {
      return currentItems.map(
        (item) => {
          if (
            item.id !== productId
          ) {
            return item;
          }

          const availableStock =
            getAvailableStock(item);

          const currentQuantity =
            Number(
              item.quantity
            ) || 0;

          // Don't go above stock
          if (
            currentQuantity >=
            availableStock
          ) {
            return item;
          }

          return {
            ...item,
            quantity:
              currentQuantity + 1,
          };
        }
      );
    });
  };

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  const decreaseQuantity = (
    productId
  ) => {
    setCartItems(
      (currentItems) =>
        currentItems
          .map((item) =>
            item.id === productId
              ? {
                  ...item,
                  quantity:
                    item.quantity - 1,
                }
              : item
          )
          .filter(
            (item) =>
              item.quantity > 0
          )
    );
  };

  // =====================================================
  // CLEAR CART
  // =====================================================

  const clearCart = () => {
    setCartItems([]);
  };

  // =====================================================
  // GET ITEM QUANTITY
  // =====================================================

  const getCartItemQuantity = (
    productId
  ) => {
    const item = cartItems.find(
      (cartItem) =>
        cartItem.id === productId
    );

    return item
      ? Number(item.quantity) || 0
      : 0;
  };

  // =====================================================
  // TOTAL QUANTITY
  // =====================================================

  const totalItems =
    cartItems.reduce(
      (total, item) =>
        total +
        (Number(item.quantity) || 0),
      0
    );

  // =====================================================
  // DIFFERENT PRODUCTS
  // =====================================================

  const uniqueItems =
    cartItems.length;

  // =====================================================
  // CART TOTAL
  // =====================================================

  const cartTotal =
    cartItems.reduce(
      (total, item) =>
        total +
        Number(item.price || 0) *
          (Number(item.quantity) ||
            0),
      0
    );

  // =====================================================
  // PROVIDER
  // =====================================================

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        getCartItemQuantity,
        getAvailableStock,
        totalItems,
        uniqueItems,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// =======================================================
// USE CART
// =======================================================

export function useCart() {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}