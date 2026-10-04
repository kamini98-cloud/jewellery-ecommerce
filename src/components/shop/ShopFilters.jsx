"use client";

const filterSections = [
  {
    title: "Category",
    key: "category",
    options: [
      "Earrings",
      "Necklaces",
      "Bangles",
      "Rings",
      "Bracelets",
    ],
  },
  {
    title: "Colour",
    key: "color",
    options: [
      "Gold",
      "Silver",
      "White",
      "Rose Gold",
      "Black",
      "Multicolour",
    ],
  },
  {
    title: "Material",
    key: "material",
    options: [
      "Gold Plated",
      "Silver Plated",
      "Alloy",
      "Kundan",
      "Pearl",
      "Oxidised Metal",
    ],
  },
  {
    title: "Occasion",
    key: "occasion",
    options: [
      "Wedding",
      "Festive",
      "Party",
      "Everyday",
      "Gifting",
    ],
  },
  {
    title: "Gender",
    key: "gender",
    options: [
      "Women",
      "Men",
      "Unisex",
    ],
  },
];

export default function ShopFilters({
  filters,
  setFilters,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  inStockOnly,
  setInStockOnly,
  discount,
  setDiscount,
}) {
  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      const currentValues = prev[key] || [];

      const updatedValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [key]: updatedValues,
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      color: [],
      material: [],
      occasion: [],
      gender: [],
    });

    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setDiscount("");
  };

  return (
    <aside className="w-full lg:w-64 lg:shrink-0">

      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold">
          Filters
        </h2>

        <button
          type="button"
          onClick={clearFilters}
          className="text-sm underline"
        >
          Clear All
        </button>
      </div>

      {/* Price */}
      <div className="border-b py-5">

        <h3 className="mb-4 font-medium">
          Price
        </h3>

        <div className="flex gap-2">

          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full border px-3 py-2 text-sm outline-none focus:border-black"
          />

          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full border px-3 py-2 text-sm outline-none focus:border-black"
          />

        </div>

      </div>

      {/* Filter Sections */}
      {filterSections.map((section) => (
        <div
          key={section.key}
          className="border-b py-5"
        >

          <h3 className="mb-4 font-medium">
            {section.title}
          </h3>

          <div className="space-y-3">

            {section.options.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-3 text-sm"
              >

                <input
                  type="checkbox"
                  checked={
                    filters[section.key]?.includes(option) || false
                  }
                  onChange={() =>
                    toggleFilter(section.key, option)
                  }
                  className="h-4 w-4 accent-black"
                />

                {option}

              </label>
            ))}

          </div>

        </div>
      ))}

      {/* Availability */}
      <div className="border-b py-5">

        <h3 className="mb-4 font-medium">
          Availability
        </h3>

        <label className="flex cursor-pointer items-center gap-3 text-sm">

          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) =>
              setInStockOnly(e.target.checked)
            }
            className="h-4 w-4 accent-black"
          />

          In Stock

        </label>

      </div>

      {/* Discount */}
      <div className="py-5">

        <h3 className="mb-4 font-medium">
          Discount
        </h3>

        <div className="space-y-3">

          {[10, 20, 30, 40, 50].map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-3 text-sm"
            >

              <input
                type="radio"
                name="discount"
                checked={Number(discount) === value}
                onChange={() => setDiscount(value)}
                className="accent-black"
              />

              {value}% or more

            </label>
          ))}

        </div>

      </div>

    </aside>
  );
}