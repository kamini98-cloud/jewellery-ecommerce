"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isWishlistLoaded, setIsWishlistLoaded] = useState(false);

  // =========================
  // Load wishlist from localStorage
  // =========================
  useEffect(() => {
    try {
      const savedWishlist =
        localStorage.getItem("wishlist");

      if (savedWishlist) {
        setWishlistItems(
          JSON.parse(savedWishlist)
        );
      }
    } catch (error) {
      console.error(
        "Failed to load wishlist:",
        error
      );
    } finally {
      setIsWishlistLoaded(true);
    }
  }, []);

  // =========================
  // Save wishlist to localStorage
  // =========================
  useEffect(() => {
    if (!isWishlistLoaded) return;

    try {
      localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlistItems)
      );
    } catch (error) {
      console.error(
        "Failed to save wishlist:",
        error
      );
    }
  }, [wishlistItems, isWishlistLoaded]);

  // =========================
  // Add to wishlist
  // =========================
  const addToWishlist = (product) => {
    setWishlistItems((currentItems) => {
      const alreadyExists = currentItems.some(
        (item) => item.id === product.id
      );

      if (alreadyExists) {
        return currentItems;
      }

      return [
        ...currentItems,
        product,
      ];
    });
  };

  // =========================
  // Remove from wishlist
  // =========================
  const removeFromWishlist = (productId) => {
    setWishlistItems((currentItems) =>
      currentItems.filter(
        (item) => item.id !== productId
      )
    );
  };

  // =========================
  // Toggle wishlist
  // =========================
  const toggleWishlist = (product) => {
    setWishlistItems((currentItems) => {
      const alreadyExists = currentItems.some(
        (item) => item.id === product.id
      );

      if (alreadyExists) {
        return currentItems.filter(
          (item) => item.id !== product.id
        );
      }

      return [
        ...currentItems,
        product,
      ];
    });
  };

  // =========================
  // Check if product is wishlisted
  // =========================
  const isInWishlist = (productId) => {
    return wishlistItems.some(
      (item) => item.id === productId
    );
  };

  // =========================
  // Total wishlist items
  // =========================
  const wishlistCount = wishlistItems.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      "useWishlist must be used inside WishlistProvider"
    );
  }

  return context;
}