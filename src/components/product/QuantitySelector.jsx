"use client";

export default function QuantitySelector({
  quantity,
  setQuantity,
}) {
  const decrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increase = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div>
      <p className="mb-3 text-sm font-medium">
        Quantity
      </p>

      <div className="flex w-fit items-center border">
        <button
          type="button"
          onClick={decrease}
          className="px-4 py-2 text-lg"
        >
          −
        </button>

        <span className="min-w-12 text-center">
          {quantity}
        </span>

        <button
          type="button"
          onClick={increase}
          className="px-4 py-2 text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}