export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-black text-white">

      <div className="mx-auto max-w-[1650px]px-4 py-12 sm:px-6 lg:px-8">

        {/* Footer Main */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold">
              MY STORE
            </h2>

            <p className="mt-4 max-w-xs text-sm leading-6 text-gray-400">
              Discover beautiful jewellery designed to make
              every moment special.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Shop
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-gray-400">
              <li>
                <a href="/shop" className="hover:text-white">
                  All Products
                </a>
              </li>

              <li>
                <a href="/collections/earrings" className="hover:text-white">
                  Earrings
                </a>
              </li>

              <li>
                <a href="/collections/necklaces" className="hover:text-white">
                  Necklaces
                </a>
              </li>

              <li>
                <a href="/collections/bracelets" className="hover:text-white">
                  Bracelets
                </a>
              </li>

              <li>
                <a href="/collections/combos" className="hover:text-white">
                  Combos
                </a>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Help
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-gray-400">
              <li>
                <a href="/contact" className="hover:text-white">
                  Contact Us
                </a>
              </li>

              <li>
                <a href="/shipping" className="hover:text-white">
                  Shipping
                </a>
              </li>

              <li>
                <a href="/returns" className="hover:text-white">
                  Returns & Refunds
                </a>
              </li>

              <li>
                <a href="/faq" className="hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Company
            </h3>

            <ul className="mt-4 space-y-3 text-sm text-gray-400">
              <li>
                <a href="/about" className="hover:text-white">
                  About Us
                </a>
              </li>

              <li>
                <a href="/privacy" className="hover:text-white">
                  Privacy Policy
                </a>
              </li>

              <li>
                <a href="/terms" className="hover:text-white">
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} My Store. All rights reserved.
        </div>

      </div>

    </footer>
  );
}