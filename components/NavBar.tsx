"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUsuario } from "@/lib/apiClient";
import { getToken, removeToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";

/**
 * Barra de navegación principal de la aplicación.
 * Muestra el nombre del usuario autenticado, enlaces de navegación,
 * acceso al perfil y el botón de cierre de sesión.
 * Solo se renderiza en vistas protegidas (no en /login ni /registro).
 */
export default function NavBar() {
  const router = useRouter();

async function handleLogout() {
  const token = getToken();

  try {
    if (token) {
      await logoutUsuario(token);
    }
  } catch (err) {
    // ignore
  } finally {
    removeToken();
    sessionStorage.removeItem("usuario");
    router.push(ROUTES.LOGIN);
  }
}

const [usuario, setUsuario] = useState<any>(null);

useEffect(() => {
  const data = sessionStorage.getItem("usuario");
  if (data) setUsuario(JSON.parse(data));
}, []);

  return (
    <div className="navbar bg-base-100 shadow-md px-6 justify-between">
  
  {/* LEFT */}
  <div className="flex-1">
    <Link href={ROUTES.HOME} className="text-xl font-bold text-primary">
      🐾 Colitas Felices
    </Link>
  </div>

  {/* CENTER */}
  <div className="hidden md:flex flex-1 justify-center gap-8">
    <Link href={ROUTES.HOME} className="link link-hover">Inicio</Link>
    <Link href={ROUTES.HOME + "#mapa"} className="link link-hover">Mapa</Link>
    <Link href={ROUTES.HOME + "#mascotas"} className="link link-hover">Mascotas</Link>
    <Link href={ROUTES.FAVORITOS} className="link link-hover">❤️ Favoritos</Link>
  </div>

  {/* RIGHT */}
  <div className="flex flex-1 justify-end items-center gap-4">
    
    {usuario && (
      <span className="hidden sm:block text-sm text-base-content/70 whitespace-nowrap">
        {usuario.username || "Usuario"}
      </span>
    )}

    <Link href={ROUTES.PROFILE} className="btn btn-sm btn-outline">
      Perfil
    </Link>

    <button onClick={handleLogout} className="btn btn-sm btn-primary">
      Salir
    </button>
  </div>
</div>
  );
}