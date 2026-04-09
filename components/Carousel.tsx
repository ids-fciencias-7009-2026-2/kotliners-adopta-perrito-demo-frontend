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
            alt="Mascota"
            fill
            className="object-cover"
          />

          {/* Overlay (esto sí se queda oscuro por UX) */}
          <div className="absolute inset-0 bg-gradient-to-t from-neutral/60 to-transparent" />

          {/* Texto */}
          <div className="absolute bottom-4 left-4">
            <p className="text-lg font-semibold">
              Encuentra a tu compañero 🐾
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}