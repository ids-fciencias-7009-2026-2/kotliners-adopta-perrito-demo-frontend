"use client";

import { PawPrint, UserPlus, ClipboardList, Search, Heart, Mail } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const pasos = [
  {
    icon: <UserPlus size={32} className="text-primary" />,
    titulo: "1. Regístrate",
    descripcion: "Crea tu cuenta seleccionando tu rol: como cuidador puedes publicar animales en adopción, como adoptante puedes explorar y manifestar interés.",
  },
  {
    icon: <ClipboardList size={32} className="text-primary" />,
    titulo: "2. Publica un animal",
    descripcion: "Si eres cuidador, registra a tus animales con su información: nombre, fotos, raza, edad, vacunas, padecimientos y código postal donde se encuentra.",
  },
  {
    icon: <Search size={32} className="text-primary" />,
    titulo: "3. Explora animales",
    descripcion: "Como adoptante, busca animales disponibles en el mapa interactivo o en la lista. Filtra por especie, raza, género, edad y distancia.",
  },
  {
    icon: <Heart size={32} className="text-primary" />,
    titulo: "4. Manifiesta tu interés",
    descripcion: "Cuando encuentres un animal que te interese, presiona \"Me interesa\". El cuidador recibirá tus datos de contacto por correo para continuar el proceso.",
  },
  {
    icon: <Mail size={32} className="text-primary" />,
    titulo: "5. Contacto directo",
    descripcion: "El cuidador recibe tu correo y pueden coordinar la adopción de forma autónoma. La plataforma facilita el primer contacto, el resto es entre ustedes.",
  },
];

export default function GuiaPage() {
  return (
    <main className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <PawPrint size={48} className="text-primary mx-auto mb-3" />
          <h1 className="text-3xl font-bold">¿Cómo funciona Colitas Felices?</h1>
          <p className="text-base-content/60 mt-2">
            Una guía rápida para entender el proceso de adopción en nuestra plataforma.
          </p>
        </div>

        {/* Pasos */}
        <div className="flex flex-col gap-6">
          {pasos.map((paso, i) => (
            <div key={i} className="card bg-base-100 shadow">
              <div className="card-body flex-row items-start gap-4">
                <div className="shrink-0 mt-1">{paso.icon}</div>
                <div>
                  <h2 className="font-bold text-lg">{paso.titulo}</h2>
                  <p className="text-base-content/70 mt-1">{paso.descripcion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Notas importantes */}
        <div className="card bg-base-100 shadow mt-8">
          <div className="card-body">
            <h2 className="font-bold text-lg mb-2">Información importante</h2>
            <ul className="list-disc list-inside text-base-content/70 space-y-2 text-sm">
              <li>La ubicación de los animales se muestra de forma aproximada (por código postal), nunca se exponen direcciones exactas.</li>
              <li>Tus datos de contacto solo se comparten con el cuidador cuando tú presionas "Me interesa".</li>
              <li>Puedes retirar tu interés en cualquier momento desde la sección de favoritos.</li>
              <li>Si encuentras una publicación inapropiada, puedes reportarla y nuestro equipo la revisará.</li>
              <li>El proceso de adopción posterior al contacto es responsabilidad de ambas partes.</li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link href={ROUTES.REGISTRO} className="btn btn-primary gap-2">
            <UserPlus size={18} /> Crear mi cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}
