"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ product }) {
  const images = [
    product.image,
    product.hoverImage,
    product.image,
    product.hoverImage,
  ].filter(Boolean);

  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto md:w-20 md:flex-col">
        {images.map((image, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedImage(index)}
            className={`relative h-20 w-20 flex-shrink-0 overflow-hidden border-2 ${
              selectedImage === index
                ? "border-black"
                : "border-transparent"
            }`}
          >
            <Image
              src={image}
              alt={`${product.name} ${index + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative aspect-square flex-1 overflow-hidden bg-gray-100">
        <Image
          src={images[selectedImage]}
          alt={product.name}
          fill
          priority
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
        />

        {/* Wishlist */}
        <button
          type="button"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-xl shadow"
        >
          ♡
        </button>
      </div>

    </div>
  );
}