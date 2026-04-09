"use client";

import Image from "next/image";
import Carousel from "@/components/Carousel";
import PetList from "@/components/PetList";
import MapView from "@/components/MapView";

export default function HomePage() {
  return (
    <main className="bg-base-100 text-base-content min-h-screen font-sans">

      {/* HERO */}
      <section className="text-center py-16 px-6 bg-base-200">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
          🐾 Bienvenido a Colitas Felices
        </h1>
        <p className="text-base-content/70 max-w-2xl mx-auto">
          Encuentra a tu próximo mejor amigo. Explora mascotas cerca de ti y dales un hogar lleno de amor.
        </p>
      </section>

      {/* CARRUSEL */}
      <Carousel />

      {/* ABOUT */}
      <section className="max-w-screen-2xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="uppercase text-sm tracking-widest text-primary">
            ADOPTA CON RESPONSABILIDAD
          </p>
          <h2 className="text-4xl font-bold mt-3 mb-4">
            Sobre la plataforma
          </h2>
          <p className="text-base-content/70 leading-relaxed mb-6">
            Colitas Felices conecta personas que buscan adoptar con quienes cuidan mascotas.
            Explora perfiles reales y encuentra a tu nuevo compañero.
          </p>
          <button className="btn btn-primary shadow-lg">
            Explorar mascotas
          </button>
        </div>

        <div className="relative w-full h-72 md:h-96">
          <Image
            src="/cat-pink.svg"
            alt="Mascotas felices"
            fill
            className="object-contain"
            priority
          />
        </div>
      </section>

      {/* MAPA */}
      <section className="max-w-screen-2xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold mb-6 text-center text-primary">
          Mascotas cerca de ti 📍
        </h2>
        <div className="bg-base-100 rounded-box shadow-xl p-4">
          <MapView />
        </div>
      </section>

      {/* LISTA */}
      <section className="max-w-screen-2xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-semibold mb-10 text-center text-primary">
          Explorar mascotas 🐶🐱
        </h2>

        <PetList />
      </section>

      {/* BENEFICIOS */}
      <section className="max-w-screen-2xl mx-auto py-16 px-6 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Adopción responsable",
            desc: "Conoce toda la información antes de decidir.",
            icon: "❤️",
          },
          {
            title: "Cerca de ti",
            desc: "Mascotas ubicadas por código postal.",
            icon: "📍",
          },
          {
            title: "Proceso simple",
            desc: "Conecta con cuidadores en un clic.",
            icon: "⚡",
          },
          {
            title: "Impacto real",
            desc: "Cambias una vida para siempre.",
            icon: "🐾",
          },
        ].map(({ title, desc, icon }, i) => (
          <div
            key={i}
            className="bg-base-100 rounded-box p-6 flex flex-col shadow-xl hover:shadow-primary/40 transition"
          >
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-base-content/70">{desc}</p>
          </div>
        ))}
      </section>

      {/* TESTIMONIOS */}
      <section className="max-w-screen-2xl mx-auto py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-10 text-primary">
          Lo que dicen nuestros usuarios 💬
        </h2>

        <div className="grid gap-8 sm:grid-cols-3">
          {[
            "“Adopté a mi perro aquí. Fue súper fácil y confiable.”",
            "“Me encanta poder ver mascotas cerca de mí.”",
            "“La mejor plataforma para adoptar responsablemente.”",
          ].map((quote, i) => (
            <blockquote
              key={i}
              className="bg-base-100 p-6 rounded-box italic text-primary shadow-xl hover:shadow-primary/40 transition"
            >
              {quote}
            </blockquote>
          ))}
        </div>
      </section>
    </main>
  );
}