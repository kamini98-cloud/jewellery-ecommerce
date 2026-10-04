import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import ProductDetails from "@/components/product/ProductDetails";
import ProductReviews from "@/components/product/ProductReviews";
import RelatedProducts from "@/components/product/RelatedProducts";
import products from "@/data/products";

export default async function ProductDetailsPage({
  params,
}) {
  const { id } = await params;

  const product = products.find(
    (item) => item.id === Number(id)
  );

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <h1 className="text-2xl font-semibold">
          Product Not Found
        </h1>
      </div>
    );
  }

  return (
    <main>

      {/* ================= PRODUCT ================= */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">

          {/* ================= GALLERY ================= */}

          <ProductGallery
            product={product}
          />

          {/* ================= INFORMATION ================= */}

          <ProductInfo
            product={product}
          />

        </div>

        {/* ================= DETAILS ================= */}

        <div className="mt-16">
          <ProductDetails
            product={product}
          />
        </div>

        {/* ================= REVIEWS ================= */}

        <ProductReviews
          product={product}
        />

        {/* ================= RELATED PRODUCTS ================= */}

        <RelatedProducts />

      </section>

    </main>
  );
}