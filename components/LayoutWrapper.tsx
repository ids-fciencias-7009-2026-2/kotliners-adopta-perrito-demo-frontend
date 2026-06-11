"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";
import { useRouteGuard } from "@/hooks/useRouteGuard";
import Loader from "@/components/Loader";

/**
 * Define el layout general de la aplicación, incluyendo la barra de navegación y la protección de rutas.
 * - Muestra NavBar en todas las páginas excepto /login y /registro.
 * - Usa useRouteGuard para proteger rutas según el estado de autenticación del usuario.
 * @param children El contenido de la página que se renderizará dentro del layout.
 */
export default function LayoutWrapper({ children }: { children: React.ReactNode }) {

    const pathname = usePathname();

    const [mounted, setMounted] = useState(false);
     useEffect(() => {
        setMounted(true); // 
    }, []);

    const checkingAuth = useRouteGuard();
    if (!mounted || checkingAuth) return <Loader />;

    const minimalNavbar = pathname === "/login" || pathname === "/registro" || pathname === "/recuperar";

    return (
        <>
        <NavBar minimal={minimalNavbar} />
        {children}
        </>
    );
}