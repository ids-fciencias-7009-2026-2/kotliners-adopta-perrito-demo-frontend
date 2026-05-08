"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logoutUsuario } from "@/lib/apiClient";
import { getToken, removeToken } from "@/lib/session";
import { ROUTES } from "@/lib/routes";
import { PawPrint, Heart, LogOut, User, Menu, Search, Dog, Plus } from "lucide-react";
import { AdvancedImage } from "@cloudinary/react";
import { getOptimizedImage } from "@/lib/cloudinary";

/** Barra de navegacion principal. Solo visible en rutas protegidas. */
export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [usuario, setUsuario] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const rol: string | undefined = usuario?.rol;

  useEffect(() => {
    const data = sessionStorage.getItem("usuario");
    if (data) setUsuario(JSON.parse(data));
    setMounted(true);

    // Actualizar el navbar si el perfil cambia en otra pestana
    function onStorage(e: StorageEvent) {
      if (e.key === "usuario" && e.newValue) {
        setUsuario(JSON.parse(e.newValue));
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
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

  /** Devuelve clases extra si la ruta coincide con el pathname actual */
  function activeClass(href: string) {
    return pathname === href ? "active font-semibold" : "";
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
          <li><Link href={ROUTES.HOME} className={activeClass(ROUTES.HOME)}>Inicio</Link></li>
          {mounted && rol === "CUIDADOR" ? (
            <>
              <li>
                <Link href={ROUTES.MIS_MASCOTAS} className={`gap-1 ${activeClass(ROUTES.MIS_MASCOTAS)}`}>
                  <Dog size={16} />
                  Mis mascotas
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PUBLICAR} className={`gap-1 ${activeClass(ROUTES.PUBLICAR)}`}>
                  <Plus size={16} />
                  Publicar
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href={ROUTES.EXPLORAR} className={`gap-1 ${activeClass(ROUTES.EXPLORAR)}`}>
                  <Search size={16} />
                  Explorar
                </Link>
              </li>
              <li>
                <Link href={ROUTES.FAVORITOS} className={`gap-1 ${activeClass(ROUTES.FAVORITOS)}`}>
                  <Heart size={16} />
                  Favoritos
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Acciones derecha */}
      <div className="navbar-end gap-2">
        {usuario?.username && (
          <span className="hidden sm:block text-sm text-base-content/60">
            @{usuario.username}
          </span>
        )}

        <Link href={ROUTES.PROFILE} className="btn btn-ghost btn-sm gap-1 px-2">
          <div className="avatar">
            <div className="w-7 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1">
              {usuario?.fotoPerfil ? (
                usuario.fotoPerfil.includes("cloudinary.com") ? (
                  <AdvancedImage
                    cldImg={getOptimizedImage(usuario.fotoPerfil, 28, 28)}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <img src={usuario.fotoPerfil} alt="Foto de perfil" />
                )
              ) : (
                <div className="bg-base-200 flex items-center justify-center w-full h-full">
                  <User size={16} className="text-base-content/50" />
                </div>
              )}
            </div>
          </div>
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
            <li><Link href={ROUTES.HOME} className={activeClass(ROUTES.HOME)}>Inicio</Link></li>
            {mounted && rol === "CUIDADOR" ? (
              <>
                <li><Link href={ROUTES.MIS_MASCOTAS} className={activeClass(ROUTES.MIS_MASCOTAS)}>Mis mascotas</Link></li>
                <li><Link href={ROUTES.PUBLICAR} className={activeClass(ROUTES.PUBLICAR)}>Publicar</Link></li>
              </>
            ) : (
              <>
                <li><Link href={ROUTES.EXPLORAR} className={activeClass(ROUTES.EXPLORAR)}>Explorar</Link></li>
                <li><Link href={ROUTES.FAVORITOS} className={activeClass(ROUTES.FAVORITOS)}>Favoritos</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
