export default function ProductDetails({ product }) {
  return (
    <section className="border-t pt-10">

      <h2 className="text-xl font-semibold">
        Product Details
      </h2>

      <p className="mt-4 leading-7 text-gray-600">
        {product.description}
      </p>

      {/* Specifications */}
      {product.specifications && (
        <div className="mt-8">

          <h3 className="text-sm font-semibold uppercase tracking-wider">
            Specifications
          </h3>

          <div className="mt-4 divide-y border-y">

            {Object.entries(product.specifications).map(
              ([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-2 py-3 text-sm"
                >
                  <span className="text-gray-500">
                    {key}
                  </span>

                  <span className="font-medium">
                    {value}
                  </span>
                </div>
              )
            )}

          </div>

        </div>
      )}

      {/* Care */}
      {product.care?.length > 0 && (
        <div className="mt-8">

          <h3 className="text-sm font-semibold uppercase tracking-wider">
            Care Instructions
          </h3>

          <ul className="mt-4 space-y-2 text-sm text-gray-600">
            {product.care.map((item) => (
              <li key={item}>
                • {item}
              </li>
            ))}
          </ul>

        </div>
      )}

    </section>
  );
}