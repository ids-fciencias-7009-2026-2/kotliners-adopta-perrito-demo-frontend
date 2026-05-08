"use client";

import { useEffect, useState } from "react";
import PetList from "@/components/PetList";
import MapView from "@/components/MapView";
import { PawPrint, MapPin, Zap, Heart, Dog, ClipboardList, Bell, Star } from "lucide-react";
import Link from "next/link";

const beneficiosAdoptante = [
  {
    title: "Adopcion responsable",
    desc: "Conoce toda la informacion antes de decidir.",
    icon: <Heart size={28} className="text-primary" />,
  },
  {
    title: "Cerca de ti",
    desc: "Mascotas ubicadas por codigo postal.",
    icon: <MapPin size={28} className="text-primary" />,
  },
  {
    title: "Proceso simple",
    desc: "Conecta con cuidadores en un clic.",
    icon: <Zap size={28} className="text-primary" />,
  },
  {
    title: "Impacto real",
    desc: "Cambias una vida para siempre.",
    icon: <PawPrint size={28} className="text-primary" />,
  },
];

const beneficiosCuidador = [
  {
    title: "Registra tus mascotas",
    desc: "Agrega la informacion de cada animal que tienes a tu cuidado.",
    icon: <ClipboardList size={28} className="text-primary" />,
  },
  {
    title: "Recibe notificaciones",
    desc: "Te avisamos por correo cuando alguien muestra interes en tus mascotas.",
    icon: <Bell size={28} className="text-primary" />,
  },
  {
    title: "Gestiona el proceso",
    desc: "Edita la informacion y marca cuando una mascota ya fue adoptada.",
    icon: <Star size={28} className="text-primary" />,
  },
  {
    title: "Impacto real",
    desc: "Cada mascota que registras tiene mas oportunidad de encontrar un hogar.",
    icon: <PawPrint size={28} className="text-primary" />,
  },
];

/** Vista del home para ADOPTANTE */
function HomeAdoptante({ nombre }: { nombre: string }) {
  return (
    <main className="bg-base-100 text-base-content min-h-screen font-sans">

      {/* HERO */}
      <section className="text-center py-16 px-6 bg-base-200">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary flex items-center justify-center gap-3">
          <PawPrint size={40} />
          Hola, {nombre}
        </h1>
        <p className="text-base-content/70 max-w-2xl mx-auto text-lg">
          Aqui puedes explorar mascotas disponibles para adopcion cerca de ti.
          Cuando encuentres una que te guste, presiona <strong>Me interesa</strong> para
          que el cuidador se ponga en contacto contigo.
        </p>
        <p className="text-base-content/50 max-w-xl mx-auto text-sm mt-3">
          Al dar <strong>Me interesa</strong> le enviamos un correo al cuidador con tu informacion de contacto
          para que pueda comunicarse contigo. Si cambias de opinion y retiras tu interes, el cuidador tambien sera notificado.
        </p>
      </section>

      {/* BENEFICIOS */}
      <section className="max-w-screen-2xl mx-auto py-12 px-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {beneficiosAdoptante.map(({ title, desc, icon }, i) => (
          <div key={i} className="bg-base-100 rounded-box p-6 flex flex-col shadow-xl hover:shadow-primary/40 transition">
            <div className="mb-3">{icon}</div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-base-content/70 text-sm">{desc}</p>
          </div>
        ))}
      </section>

      {/* MAPA */}
      <section id="mapa" className="max-w-screen-2xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-semibold mb-6 text-center text-primary flex items-center justify-center gap-2">
          <MapPin size={28} />
          Mascotas cerca de ti
        </h2>
        <div className="bg-base-100 rounded-box shadow-xl p-4">
          <MapView />
        </div>
      </section>

      {/* EXPLORAR: tarjetas */}
      <section id="mascotas" className="max-w-screen-2xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-semibold text-primary flex items-center gap-2">
            <PawPrint size={28} />
            Explorar mascotas
          </h2>
          <a href="/explorar" className="btn btn-outline btn-primary btn-sm gap-2">
            <MapPin size={16} />
            Ver en mapa
          </a>
        </div>
        <PetList />
      </section>

    </main>
  );
}

/** Vista del home para CUIDADOR */
function HomeCuidador({ nombre }: { nombre: string }) {
  return (
    <main className="bg-base-100 text-base-content min-h-screen font-sans">

      {/* HERO */}
      <section className="text-center py-16 px-6 bg-base-200">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary flex items-center justify-center gap-3">
          <Dog size={40} />
          Hola, {nombre}
        </h1>
        <p className="text-base-content/70 max-w-2xl mx-auto text-lg">
          Colitas Felices te ayuda a encontrar hogares para las mascotas que cuidas.
          Registra tus animales, recibe notificaciones de adoptantes interesados
          y gestiona todo el proceso desde aqui.
        </p>
      </section>

      {/* SOBRE LA PLATAFORMA PARA CUIDADORES */}
      <section className="max-w-screen-2xl mx-auto py-12 px-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {beneficiosCuidador.map(({ title, desc, icon }, i) => (
          <div key={i} className="bg-base-100 rounded-box p-6 flex flex-col shadow-xl hover:shadow-primary/40 transition">
            <div className="mb-3">{icon}</div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            <p className="text-base-content/70 text-sm">{desc}</p>
          </div>
        ))}
      </section>

      {/* MIS MASCOTAS */}
      <section id="mascotas" className="max-w-screen-2xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-primary flex items-center gap-2">
            <PawPrint size={24} />
            Mis mascotas
          </h2>
          <a href="/mis-mascotas" className="btn btn-outline btn-primary btn-sm gap-2">
            Ver todas
          </a>        </div>
        <PetList />
      </section>

    </main>
  );
}

/** Pagina principal — renderiza vista segun el rol del usuario autenticado */
export default function HomePage() {
  const [rol, setRol] = useState<string | null>(null);
  const [nombre, setNombre] = useState("amigo");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem("usuario");
    if (data) {
      const usuario = JSON.parse(data);
      setRol(usuario.rol ?? null);
      setNombre(usuario.nombres ?? "amigo");
    }
    setMounted(true);
  }, []);

  // Esperar a leer sessionStorage antes de renderizar
  if (!mounted) return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg text-primary" />
    </div>
  );

  if (rol === "CUIDADOR") return <HomeCuidador nombre={nombre} />;
  return <HomeAdoptante nombre={nombre} />;
}
