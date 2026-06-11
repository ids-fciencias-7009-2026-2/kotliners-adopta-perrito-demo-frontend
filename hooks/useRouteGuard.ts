"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, removeToken } from "@/lib/session";
import { PUBLIC_ROUTES, PROTECTED_ROUTES, ROUTES } from "@/lib/routes";
import { obtenerPerfil } from "@/lib/apiClient";
import sessionEvents from "@/lib/sessionEvents";

/**
 * Hook que protege rutas segun el estado de autenticación del usuario.
 * Inicia en estado "verificando" para evitar que se muestre contenido
 * protegido antes de confirmar la autenticación.
 * @returns true mientras se verifica, false cuando termina.
 */
export function useRouteGuard(): boolean {
    const router = useRouter();
    const pathname = usePathname();

    // Siempre empieza verificando — evita flash de contenido sin sesión
    const [checking, setChecking] = useState(true);
    const lastValidatedPath = useRef<string | null>(null);

    /** Limpia la sesión y redirige al login. */
    function handleSessionExpired() {
        removeToken();
        sessionStorage.removeItem("usuario");
        router.replace(ROUTES.LOGIN);
    }

    // Suscribirse al evento de sesión expirada
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
            // Mantener checking=true hasta que la redirección ocurra para no mostrar contenido
            return;
        }

        // Con token en ruta publica — validar y redirigir al home solo si es válido
        if (isPublicRoute && !!token) {
            obtenerPerfil(token).then((res) => {
                if (res.ok) {
                    router.replace(ROUTES.HOME);
                } else {
                    // Token inválido — limpiar y dejar al usuario en la ruta pública
                    removeToken();
                    sessionStorage.removeItem("usuario");
                    setChecking(false);
                }
            }).catch(() => {
                setChecking(false);
            });
            return;
        }

        // Con token en ruta protegida — validar contra backend solo si cambia la ruta
        if (isProtectedRoute && token) {
            if (lastValidatedPath.current === pathname) {
                setChecking(false);
                return;
            }
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            obtenerPerfil(token).then((res) => {
                clearTimeout(timeoutId);
                if (!res.ok) {
                    handleSessionExpired();
                } else {
                    // Restricción por rol
                    const rol = res.data.rol;
                    const adminOnly = [ROUTES.ADMIN];
                    const noAdmin = [ROUTES.EXPLORAR, ROUTES.FAVORITOS, ROUTES.MIS_MASCOTAS, ROUTES.PUBLICAR, ROUTES.HOME];
                    if (rol === "ADMINISTRADOR" && noAdmin.some((r) => pathname.startsWith(r))) {
                        router.replace(ROUTES.ADMIN);
                        return;
                    }
                    if (rol !== "ADMINISTRADOR" && adminOnly.some((r) => pathname.startsWith(r))) {
                        router.replace(ROUTES.HOME);
                        return;
                    }
                    lastValidatedPath.current = pathname;
                    setChecking(false);
                }
            }).catch(() => {
                clearTimeout(timeoutId);
                // Si el backend no responde o hay timeout, cerrar sesión por seguridad
                handleSessionExpired();
            });
            return;
        }

        setChecking(false);
    }, [pathname]);

    return checking;
}
