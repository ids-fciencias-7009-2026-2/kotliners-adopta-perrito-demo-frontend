"use client";

import Image from "next/image";

export default function Carousel() {
  const images = [
    "/cat1.jpg",
    "/dog1.jpg",
    "/cat2.jpg",
  ];

  return (
    <div className="overflow-x-auto flex gap-6 py-8 px-6 snap-x">
      {images.map((src, i) => (
        <div
          key={i}
          className="
            relative
            min-w-[320px] md:min-w-[400px]
            h-56 md:h-64
            rounded-box
            overflow-hidden
            snap-center
            shadow-xl
            transition-all duration-300
            hover:shadow-primary/40
            hover:-translate-y-2
          "
        >
          {/* Imagen */}
          <Image
            src={src}
            alt="Máscota"
            fill
            className="object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral/30 to-transparent" />
        </div>
      ))}
    </div>
  );
}