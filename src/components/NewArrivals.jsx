"use client";

import { useEffect, useState } from "react";

import ProductSection from "@/components/ProductSection";
import defaultProducts from "@/data/products";

const PRODUCT_KEY = "adminProducts";

export default function NewArrivals() {
  const [allProducts, setAllProducts] = useState(defaultProducts);

  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(PRODUCT_KEY);

      if (savedProducts) {
        setAllProducts(JSON.parse(savedProducts));
      }
    } catch (error) {
      console.error("Failed to load admin products:", error);
      setAllProducts(defaultProducts);
    }
  }, []);

  const newProducts = allProducts.filter(
    (product) => product.isNew === true
  );

  return (
    <ProductSection
      title="New Arrivals"
      subtitle="Just In"
      products={newProducts}
      collection="newarrivals"
    />
  );
}