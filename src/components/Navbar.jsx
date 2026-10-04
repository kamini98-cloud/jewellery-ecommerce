"use client";

import Link from "next/link";
import { useEffect,useState,useRef } from "react";

import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext";

import ProductSearch from "@/components/product/ProductSearch";

export default function Navbar() {
  // ================= CART =================
  const { totalItems } = useCart();

  // ================= WISHLIST =================
  const { wishlistItems } = useWishlist();

  // ================= AUTH =================
  const { user, logout } = useAuth();

  // ================= STATES =================
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef(null);




// ================= CLOSE ACCOUNT DROPDOWN ON OUTSIDE CLICK =================

useEffect(() => {
  const handleClickOutside = (event) => {
    if (
      accountRef.current &&
      !accountRef.current.contains(event.target)
    ) {
      setIsAccountOpen(false);
    }
  };

  document.addEventListener(
    "mousedown",
    handleClickOutside
  );

  return () => {
    document.removeEventListener(
      "mousedown",
      handleClickOutside
    );
  };
}, []);



  // ================= ACCOUNT LINK =================
  const accountLink = user ? "/account" : "/login";

  // ================= USER NAME =================
  const userName =
    user?.name ||
    user?.fullName ||
    user?.username ||
    "Account";

  // ================= LOGOUT =================
  const handleLogout = () => {
    setIsAccountOpen(false);
    setIsMenuOpen(false);

    logout();
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="border-b bg-white">
        {/* <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8"> */}
<div className="mx-auto flex max-w-[1650px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* ================= LOGO ================= */}

          <Link
            href="/"
            className="text-2xl font-bold"
          >
            MY STORE
          </Link>

          {/* ================= DESKTOP NAVIGATION ================= */}

          <div className="hidden items-center gap-8 md:flex">

            <Link
              href="/"
              className="transition hover:text-gray-500"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="transition hover:text-gray-500"
            >
              Shop
            </Link>

            <Link
              href="/collections"
              className="transition hover:text-gray-500"
            >
              Collections
            </Link>

            <Link
              href="/about"
              className="transition hover:text-gray-500"
            >
              About
            </Link>

            <Link
              href="/contact"
              className="transition hover:text-gray-500"
            >
              Contact
            </Link>

          </div>

          {/* ================= DESKTOP ACTIONS ================= */}

          <div className="hidden items-center gap-5 md:flex">

            {/* ================= SEARCH ================= */}

            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
              className="text-xl transition hover:scale-110"
            >
              🔍
            </button>

            {/* ================= WISHLIST ================= */}

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative text-2xl transition hover:scale-110"
            >
              ♡

              {wishlistItems.length > 0 && (
                <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>


            
            <Link
              href="/cart"
              aria-label="Shopping Cart"
              className="relative text-xl transition hover:scale-110"
            >
              🛒

              {totalItems > 0 && (
                <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* ================= ACCOUNT ================= */}

            {user ? (

              <div
  ref={accountRef}
  className="relative">

                {/* USER NAME */}

                <button
                  type="button"
                  onClick={() =>
                    setIsAccountOpen(
                      !isAccountOpen
                    )
                  }
                  aria-label="Account menu"
                  aria-expanded={
                    isAccountOpen
                  }
                  className="flex items-center gap-2 text-sm font-medium transition hover:text-gray-500"
                >

                  <span className="text-xl">
                    👤
                  </span>

                  {/* <span className="max-w-[120px] truncate">
                    {userName}
                  </span> */}

                  <span
                    className={`text-xs transition-transform duration-200 ${
                      isAccountOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  >
                    ▼
                  </span>

                </button>

                {/* ACCOUNT DROPDOWN */}

                {isAccountOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-52 border border-gray-200 bg-white py-2 shadow-lg">

                    {/* USER NAME */}

                    <div className="border-b px-4 py-3">

                      <p className="text-xs text-gray-500">
                        Signed in as
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold">
                        {userName}
                      </p>

                    </div>

                    {/* MY ACCOUNT */}

                    <Link
                      href="/account"
                      onClick={() =>
                        setIsAccountOpen(false)
                      }
                      className="block px-4 py-3 text-sm transition hover:bg-gray-50"
                    >
                      My Account
                    </Link>

                    {/* MY ORDERS */}

                    <Link
                      href="/account/orders"
                      onClick={() =>
                        setIsAccountOpen(false)
                      }
                      className="block px-4 py-3 text-sm transition hover:bg-gray-50"
                    >
                      My Orders
                    </Link>

                    {/* WISHLIST */}

                    <Link
                      href="/wishlist"
                      onClick={() =>
                        setIsAccountOpen(false)
                      }
                      className="flex items-center justify-between px-4 py-3 text-sm transition hover:bg-gray-50"
                    >

                      <span>
                        Wishlist
                      </span>

                      {wishlistItems.length > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] text-white">
                          {wishlistItems.length}
                        </span>
                      )}

                    </Link>

                    {/* LOGOUT */}

                    <div className="mt-1 border-t pt-1">

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                      >
                        Logout
                      </button>

                    </div>

                  </div>
                )}

              </div>

            ) : (

              /* LOGGED OUT */

              <Link
                href="/login"
                aria-label="Login"
                className="flex items-center gap-2 text-sm font-medium transition hover:text-gray-500"
              >
                <span className="text-xl">
                  👤
                </span>

                <span>
                  Login
                </span>
              </Link>

            )}

            {/* ================= CART ================= */}


          </div>

          {/* ================= MOBILE MENU BUTTON ================= */}

          <button
            type="button"
            className="text-2xl md:hidden"
            onClick={() =>
              setIsMenuOpen(!isMenuOpen)
            }
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>

        </div>

        {/* ================= MOBILE MENU ================= */}

        {isMenuOpen && (
          <div className="border-t bg-white px-4 py-5 md:hidden">

            {/* ================= MOBILE NAVIGATION ================= */}

            <div className="flex flex-col gap-5">

              <Link
                href="/"
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className="transition hover:text-gray-500"
              >
                Home
              </Link>

              <Link
                href="/shop"
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className="transition hover:text-gray-500"
              >
                Shop
              </Link>

              <Link
                href="/collections"
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className="transition hover:text-gray-500"
              >
                Collections
              </Link>

              <Link
                href="/about"
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className="transition hover:text-gray-500"
              >
                About
              </Link>

              <Link
                href="/contact"
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className="transition hover:text-gray-500"
              >
                Contact
              </Link>

            </div>

            {/* ================= MOBILE ACTIONS ================= */}

            <div className="mt-5 flex flex-wrap gap-6 border-t pt-5">

              {/* ================= SEARCH ================= */}

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="flex items-center gap-2"
              >
                <span>🔍</span>
                <span>Search</span>
              </button>

              {/* ================= WISHLIST ================= */}

              <Link
                href="/wishlist"
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className="flex items-center gap-2"
              >
                <span>♡</span>

                <span>
                  Wishlist
                </span>

                {wishlistItems.length > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* ================= ACCOUNT ================= */}

              {user ? (

                <div className="w-full">

                  <button
                    type="button"
                    onClick={() =>
                      setIsAccountOpen(
                        !isAccountOpen
                      )
                    }
                    className="flex w-full items-center justify-between"
                  >

                    <span className="flex items-center gap-2">

                      <span>
                        👤
                      </span>

                      <span className="font-medium">
                        {userName}
                      </span>

                    </span>

                    <span
                      className={`text-xs transition-transform duration-200 ${
                        isAccountOpen
                          ? "rotate-180"
                          : ""
                      }`}
                    >
                      ▼
                    </span>

                  </button>

                  {isAccountOpen && (
                    <div className="mt-3 border-l-2 border-gray-200 pl-4">

                      <div className="flex flex-col gap-3">

                        <Link
                          href="/account"
                          onClick={() => {
                            setIsAccountOpen(false);
                            setIsMenuOpen(false);
                          }}
                          className="text-sm"
                        >
                          My Account
                        </Link>

                        <Link
                          href="/account/orders"
                          onClick={() => {
                            setIsAccountOpen(false);
                            setIsMenuOpen(false);
                          }}
                          className="text-sm"
                        >
                          My Orders
                        </Link>

                        <Link
                          href="/wishlist"
                          onClick={() => {
                            setIsAccountOpen(false);
                            setIsMenuOpen(false);
                          }}
                          className="text-sm"
                        >
                          Wishlist
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="text-left text-sm text-red-600"
                        >
                          Logout
                        </button>

                      </div>

                    </div>
                  )}

                </div>

              ) : (

                <Link
                  href="/login"
                  onClick={() =>
                    setIsMenuOpen(false)
                  }
                  className="flex items-center gap-2"
                >
                  <span>👤</span>

                  <span>
                    Login
                  </span>
                </Link>

              )}

              {/* ================= CART ================= */}

              <Link
                href="/cart"
                onClick={() =>
                  setIsMenuOpen(false)
                }
                className="flex items-center gap-2"
              >

                <span>
                  🛒
                </span>

                <span>
                  Cart
                </span>

                {totalItems > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-medium text-white">
                    {totalItems}
                  </span>
                )}

              </Link>

            </div>

          </div>
        )}

      </nav>

      {/* ================= PRODUCT SEARCH ================= */}

      <ProductSearch
        isOpen={isSearchOpen}
        onClose={() =>
          setIsSearchOpen(false)
        }
      />
    </>
  );
}