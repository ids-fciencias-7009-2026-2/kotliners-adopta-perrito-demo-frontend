Iteración 2

ENTREGA: Viernes 10 de Abril de 2026

1. Objetivo de la Entrega
La presente entrega corresponde a la Iteración 2 del proyecto y tiene como propósito:
Evolucionar el sistema incorporando una interfaz de usuario funcional que
consuma la API desarrollada en la Iteración 1.
Ampliar el backend con el endpoint de actualización de información del usuario.
Reflejar el estado real del sistema completo: frontend, backend y base de datos
operando de forma integrada.
Aplicar principios de versionamiento profesional en ambos repositorios y en la
documentación.
Esta iteración representa la primera versión del sistema con flujo completo end-to-end:
desde la interfaz de usuario hasta la persistencia en base de datos.

2. Componentes Obligatorios de la Entrega
La entrega consta de tres elementos obligatorios e inseparables:
2.1 Backend — Nuevo endpoint y versión actualizada
El equipo deberá:
Mantener todos los endpoints funcionales de la Iteración 1.
Implementar el nuevo endpoint de actualización de información del usuario ( PUT
/usuarios o equivalente según su diseño).
Verificar que el sistema compile, ejecute y responda correctamente de extremo a
extremo.
Versionamiento obligatorio del código — Backend

Iteración 2 1

git tag 2.0.0
git push origin 2.0.0
El tag 2.0.0 refleja una evolución mayor del sistema, ya que incorpora un nuevo
endpoint y la integración con el frontend.
No se aceptarán entregas sin tag correctamente creado y publicado en el repositorio
remoto.

2.2 Frontend — Interfaz de usuario funcional
El equipo deberá implementar en su repositorio de frontend las siguientes vistas:
Registro: formulario para crear una cuenta de usuario.
Login: formulario para iniciar sesión con credenciales.
Home: vista que simula la pantalla principal de su plataforma despues de hacer el
login.
Perfil: visualización de la información del usuario autenticado ( /me ).
Actualización de perfil: formulario para modificar la información del usuario.
Logout: acción para cerrar la sesión activa.
Requisitos técnicos del frontend
Consumir la API del backend mediante fetch o cualquier biblioteca conveniente en
su framework (por ejemplo axios ).
Almacenar el token de sesión en sessionStorage .
Enviar el token en el header Authorization en todas las peticiones que lo requieran.
Proteger las vistas que requieren autenticación: si no existe un token válido en
sessionStorage , redirigir al usuario a la vista de login.
Manejar errores de forma visible para el usuario (credenciales incorrectas, sesión
expirada, campos vacíos, etc.).
Versionamiento obligatorio del código — Frontend

Iteración 2 2

git tag 1.0.0
git push origin 1.0.0
El tag 1.0.0 representa la primera versión funcional del frontend.
No se aceptarán entregas sin tag correctamente creado y publicado en el repositorio
remoto del frontend.

2.3 Documento Evolutivo del Sistema
Esta entrega no consiste en capturas, evidencias técnicas ni fragmentos de código.
Se espera un documento actualizado que funcione como:
Documento funcional del sistema completo (backend + frontend).
Manual descriptivo del estado actual del sistema.
Base de conocimiento para nuevos desarrolladores o integrantes del equipo.
Referencia para stakeholders o personas de producto.
El documento debe permitir comprender:
Qué hace el sistema y cómo interactúa el usuario con él.
Qué funcionalidades existen en esta iteración.
Qué tecnologías componen el sistema completo.
Qué limitaciones tiene el sistema en su estado actual.

3. Alcance de la Iteración 2
La documentación, el backend y el frontend deberán centrarse en las siguientes
funcionalidades relacionadas con la entidad Usuario:
Registro de usuario.
Inicio de sesión.
Cierre de sesión.
Consulta de información del usuario autenticado.

Iteración 2 3

Actualización de información del usuario autenticado.
No deberán describirse funcionalidades que no hayan sido implementadas.

4. Estructura del Documento
El documento deberá conservar la misma estructura obligatoria de la Iteración 1,
evolucionándola para reflejar el estado actual del sistema.
No se debe crear un documento nuevo desde cero. Se espera que:
Se tome como base el documento entregado en la Iteración 1.
Se actualicen las secciones necesarias para reflejar los cambios.
Se incorporen las nuevas funcionalidades y tecnologías del frontend.
Se delimite claramente el alcance de la Iteración 2.
Se actualice la sección de limitaciones actuales.
Adicionalmente, deberán incluirse o actualizarse explícitamente las siguientes
secciones:
4.3 Tecnologías Utilizadas
Deberá actualizarse para incluir las tecnologías del frontend:
Lenguaje o framework de frontend utilizado.
Mecanismo de comunicación con el backend (fetch, API REST).
Herramientas relevantes incorporadas en esta iteración.
Cada tecnología nueva deberá incluir una breve justificación de su elección.
4.4 Arquitectura General
Deberá actualizarse para reflejar que el sistema ahora tiene dos componentes
independientes que se comunican entre sí:
Frontend: interfaz de usuario que consume la API.
Backend: API REST organizada en capas (Controller, Service, Repository).

Iteración 2 4

Comunicación: el frontend realiza peticiones HTTP al backend mediante fetch o
la biblioteca elegida.
La explicación debe ser conceptual y clara. No se deberá incluir código en esta sección.
4.5 Flujo de Autenticación
Se deberá describir conceptualmente el flujo de autenticación del sistema:
Cómo el usuario inicia sesión desde el frontend.
Cómo se almacena y utiliza el token.
Cómo se protege el acceso a vistas y endpoints que requieren autenticación.
Qué ocurre cuando el token es inválido o no existe.
La descripción debe ser funcional, no técnica.
4.7 Modelo Conceptual de Datos
Deberá mantenerse actualizado con los atributos de la entidad Usuario y su Schema,
incorporando cualquier campo nuevo que haya sido añadido en esta iteración.

5. Versionamiento Formal
5.1 Versionamiento del Código
Repositorio Iteración Versión
Backend Iteración 1 1.0.0
Backend Iteración 2 2.0.0
Frontend Iteración 2 1.0.0
5.2 Versionamiento del Documento
El documento deberá indicar claramente en la portada:
Versión del Documento: 2.0
Cada nueva versión del documento deberá:
Indicar fecha de actualización.

Iteración 2 5

Mantener coherencia con la versión del sistema.
Reflejar el estado real del proyecto en esta iteración.

6. Criterios de Evaluación
Se evaluará:
Correcta evolución del documento respecto a la Iteración 1.
Coherencia entre el alcance declarado y las funcionalidades implementadas.
Implementación funcional de todas las vistas requeridas en el frontend.
Correcta comunicación entre frontend y backend (consumo de API).
Manejo adecuado del token: almacenamiento, envío en headers y protección de
vistas.
Implementación correcta del nuevo endpoint de actualización en el backend.
Calidad conceptual de la arquitectura descrita en el documento.
Correcto versionamiento del backend (tag 2.0.0 ).
Correcto versionamiento del frontend (tag 1.0.0 ).
Correcto versionamiento del documento ( 2.0 ).

7. Entregables
Documento actualizado en formato PDF (versión 2.0).
Repositorio de backend con:
Código funcional incluyendo el nuevo endpoint.
Tag 2.0.0 correctamente creado y publicado.
Repositorio de frontend con:
Código funcional con todas las vistas requeridas.
Tag 1.0.0 correctamente creado y publicado."use client";

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