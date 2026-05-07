"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, removeToken } from "@/lib/session";
import { PUBLIC_ROUTES, PROTECTED_ROUTES, ROUTES } from "@/lib/routes";
import { obtenerPerfil } from "@/lib/apiClient";
import sessionEvents from "@/lib/sessionEvents";

/**
 * Hook que protege rutas segun el estado de autenticacion del usuario.
 *
 * Estrategia event-driven (patron observador):
 * - Valida el token contra el backend solo al cambiar de ruta (no en cada re-render).
 * - Escucha el evento "session:expired" emitido por el interceptor de Axios.
 * - Cuando el token expira, el evento dispara el cierre de sesion automaticamente.
 *
 * @returns true mientras se verifica la autenticacion, false cuando termina.
 */
export function useRouteGuard(): boolean {
    const router = useRouter();
    const pathname = usePathname();
    const token = getToken();

    const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

    const [checking, setChecking] = useState(true);

    // Ultima ruta validada — evita llamadas repetidas al backend en la misma ruta
    const lastValidatedPath = useRef<string | null>(null);

    /** Limpia la sesion y redirige al login. */
    function handleSessionExpired() {
        removeToken();
        sessionStorage.removeItem("usuario");
        router.replace(ROUTES.LOGIN);
    }

    useEffect(() => {
        // Suscribirse al evento de sesion expirada (emitido por el interceptor de Axios)
        sessionEvents.on("session:expired", handleSessionExpired);
        return () => {
            sessionEvents.off("session:expired", handleSessionExpired);
        };
    }, []);

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

        // Ruta protegida con token — validar contra el backend solo si cambia la ruta
        if (isProtectedRoute && token) {
            if (lastValidatedPath.current === pathname) {
                // Ya validamos esta ruta, no repetir la llamada
                setChecking(false);
                return;
            }

            obtenerPerfil(token).then((res) => {
                if (!res.ok) {
                    handleSessionExpired();
                } else {
                    lastValidatedPath.current = pathname;
                }
                setChecking(false);
            });
            return;
        }

        setChecking(false);
    }, [pathname]);

    return checking;
}
