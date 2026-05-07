"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, removeToken } from "@/lib/session";
import { PUBLIC_ROUTES, PROTECTED_ROUTES, ROUTES } from "@/lib/routes";
import { obtenerPerfil } from "@/lib/apiClient";

/**
 * Hook que protege rutas segun el estado de autenticacion del usuario.
 * - Ruta protegida sin token: redirige a /login.
 * - Ruta publica con token: redirige a /home.
 * - Token invalido en el backend: limpia sesion y redirige a /login.
 * @returns true mientras se verifica la autenticacion, false cuando termina.
 */
export function useRouteGuard(): boolean {
    const router = useRouter();
    const pathname = usePathname();
    const token = getToken();

    const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Ruta protegida sin token — redirigir inmediatamente
        if (isProtectedRoute && !token) {
            router.replace(ROUTES.LOGIN);
            setChecking(false);
            return;
        }

        // Ruta publica con token — redirigir al home
        if (isPublicRoute && !!token) {
            router.replace(ROUTES.HOME);
            setChecking(false);
            return;
        }

        // Ruta protegida con token — validar contra el backend
        if (isProtectedRoute && token) {
            obtenerPerfil(token).then((res) => {
                if (!res.ok) {
                    // Token invalidado en el backend (ej. logout desde Postman)
                    removeToken();
                    sessionStorage.removeItem("usuario");
                    router.replace(ROUTES.LOGIN);
                }
                setChecking(false);
            });
            return;
        }

        setChecking(false);
    }, [pathname]);

    return checking;
}
