import ProductCard from "@/components/ProductCard";

const relatedProducts = [
  {
    id: 2,
    name: "Kundan Necklace Set",
    price: 899,
    oldPrice: 1199,
    image: "/products/Bangles.webp",
    hoverImage: "/products/5.webp",
    rating: 4.6,
    reviews: 18,
    offer: "Buy 1 Get 1",
  },
  {
    id: 3,
    name: "Traditional Bracelet",
    price: 599,
    oldPrice: 799,
    image: "/products/Bangles.webp",
    hoverImage: "/products/5.webp",
    rating: 4.9,
    reviews: 31,
  },
  {
    id: 4,
    name: "Elegant Ring Set",
    price: 399,
    oldPrice: 499,
    image: "/products/Bangles.webp",
    hoverImage: "/products/5.webp",
    rating: 4.7,
    reviews: 15,
  },
  {
    id: 5,
    name: "Designer Pearl Earrings",
    price: 699,
    oldPrice: 899,
    image: "/products/Bangles.webp",
    hoverImage: "/products/5.webp",
    rating: 4.8,
    reviews: 12,
    offer: "New Arrival",
  },
];

export default function RelatedProducts() {
  return (
    <section className="mt-16 border-t pt-12">

      {/* Heading */}
      <div className="mb-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
          You Might Like
        </p>

        <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
          You May Also Like
        </h2>
      </div>

      {/* Products */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        {relatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
          />
        ))}
      </div>

    </section>
  );
}