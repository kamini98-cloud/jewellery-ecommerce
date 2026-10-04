import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import allProducts from "@/data/products";

export default function ProductSection({
  title = "Best Sellers",
  subtitle = "Our Collection",
  products,
  collection = "bestsellers",
}) {
  const displayProducts =
    products ||
    allProducts.filter(
      (product) => product.isBestSeller
    );

  const viewAllLink = `/shop?collection=${collection}`;

  return (
    <section className="py-12 sm:py-16">
      {/* <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"> */}
      <div className="mx-auto max-w-[1650px] px-4 sm:px-6 lg:px-8">

        {/* ================= HEADING ================= */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500">
              {subtitle}
            </p>

            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
              {title}
            </h2>
          </div>

          {/* DESKTOP VIEW ALL */}
          <Link
            href={viewAllLink}
            className="hidden text-sm font-medium underline transition hover:text-gray-500 sm:block"
          >
            View All
          </Link>
        </div>

        {/* ================= PRODUCTS ================= */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {/* ================= MOBILE VIEW ALL ================= */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href={viewAllLink}
            className="text-sm font-medium underline transition hover:text-gray-500"
          >
            View All
          </Link>
        </div>

      </div>
    </section>
  );
}