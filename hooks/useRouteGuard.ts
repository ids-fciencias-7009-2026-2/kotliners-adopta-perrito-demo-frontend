"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, removeToken } from "@/lib/session";
import { PUBLIC_ROUTES, PROTECTED_ROUTES, ROUTES } from "@/lib/routes";
import { obtenerPerfil } from "@/lib/apiClient";
import sessionEvents from "@/lib/sessionEvents";

/**
 * Hook que protege rutas segun el estado de autenticacion del usuario.
 * Inicia en estado "verificando" para evitar que se muestre contenido
 * protegido antes de confirmar la autenticacion.
 * @returns true mientras se verifica, false cuando termina.
 */
export function useRouteGuard(): boolean {
    const router = useRouter();
    const pathname = usePathname();

    // Siempre empieza verificando — evita flash de contenido sin sesion
    const [checking, setChecking] = useState(true);
    const lastValidatedPath = useRef<string | null>(null);

    /** Limpia la sesion y redirige al login. */
    function handleSessionExpired() {
        removeToken();
        sessionStorage.removeItem("usuario");
        router.replace(ROUTES.LOGIN);
    }

    // Suscribirse al evento de sesion expirada
    useEffect(() => {
        sessionEvents.on("session:expired", handleSessionExpired);
        return () => sessionEvents.off("session:expired", handleSessionExpired);
    }, []);

    useEffect(() => {
        const token = getToken();
        const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
        const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

        // Sin token en ruta protegida — redirigir inmediatamente sin llamar al backend
        if (isProtectedRoute && !token) {
            router.replace(ROUTES.LOGIN);
            // Mantener checking=true hasta que la redireccion ocurra para no mostrar contenido
            return;
        }

        // Con token en ruta publica — redirigir al home
        if (isPublicRoute && !!token) {
            router.replace(ROUTES.HOME);
            return;
        }

        // Con token en ruta protegida — validar contra backend solo si cambia la ruta
        if (isProtectedRoute && token) {
            if (lastValidatedPath.current === pathname) {
                setChecking(false);
                return;
            }
            obtenerPerfil(token).then((res) => {
                if (!res.ok) {
                    handleSessionExpired();
                } else {
                    lastValidatedPath.current = pathname;
                    setChecking(false);
                }
            });
            return;
        }

        setChecking(false);
    }, [pathname]);

    return checking;
}
