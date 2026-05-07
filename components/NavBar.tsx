"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutUsuario } from "@/lib/apiClient";
import { getToken, removeToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import { PawPrint, Heart, LogOut, User, Menu } from "lucide-react";

/** Barra de navegacion principal. Solo visible en rutas protegidas. */
export default function NavBar() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem("usuario");
    if (data) setUsuario(JSON.parse(data));
  }, []);

  /** Llama al endpoint de logout, limpia sessionStorage y redirige al login. */
  async function handleLogout() {
    const token = getToken();
    try {
      if (token) await logoutUsuario(token);
    } catch {
      // ignorar errores de red al cerrar sesion
    } finally {
      removeToken();
      sessionStorage.removeItem("usuario");
      router.push(ROUTES.LOGIN);
    }
  }

  return (
    <div className="navbar bg-base-100 shadow-md px-4">

      {/* Logo */}
      <div className="navbar-start">
        <Link href={ROUTES.HOME} className="btn btn-ghost text-primary gap-2 text-lg font-bold">
          <PawPrint size={22} />
          Colitas Felices
        </Link>
      </div>

      {/* Menu central — solo desktop */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          <li><Link href={ROUTES.HOME}>Inicio</Link></li>
          <li><Link href={ROUTES.HOME + "#mapa"}>Mapa</Link></li>
          <li><Link href={ROUTES.HOME + "#mascotas"}>Mascotas</Link></li>
          <li>
            <Link href={ROUTES.FAVORITOS} className="gap-1">
              <Heart size={16} />
              Favoritos
            </Link>
          </li>
        </ul>
      </div>

      {/* Acciones derecha */}
      <div className="navbar-end gap-2">
        {usuario && (
          <span className="hidden sm:block text-sm text-base-content/60">
            @{usuario.username}
          </span>
        )}

        <Link href={ROUTES.PROFILE} className="btn btn-ghost btn-sm gap-1">
          <User size={16} />
          <span className="hidden sm:inline">Perfil</span>
        </Link>

        <button onClick={handleLogout} className="btn btn-primary btn-sm gap-1">
          <LogOut size={16} />
          <span className="hidden sm:inline">Salir</span>
        </button>

        {/* Menu hamburguesa — solo mobile */}
        <div className="dropdown dropdown-end lg:hidden">
          <label tabIndex={0} className="btn btn-ghost btn-sm">
            <Menu size={20} />
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link href={ROUTES.HOME}>Inicio</Link></li>
            <li><Link href={ROUTES.HOME + "#mapa"}>Mapa</Link></li>
            <li><Link href={ROUTES.HOME + "#mascotas"}>Mascotas</Link></li>
            <li><Link href={ROUTES.FAVORITOS}>Favoritos</Link></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
