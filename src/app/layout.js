import "./globals.css";

import AnnouncementBar from "@/components/AnnouncementBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>

              <AnnouncementBar />

              <Navbar />

              {children}

              <Footer />

            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}