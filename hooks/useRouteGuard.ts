"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken } from "@/lib/session";
import { PUBLIC_ROUTES, PROTECTED_ROUTES, ROUTES } from "@/lib/routes";

/**
 * Protege rutas según el estado de autenticación del usuario.
 * - Si el usuario no tiene token y accede a una ruta protegida, se redirige a /login.
 * - Si el usuario tiene token y accede a una ruta pública, se redirige a /home.
 * Debe llamarse al inicio de cada página para aplicar la protección.
 */
export function useRouteGuard(): boolean {
    const router = useRouter();
    const pathname = usePathname();
    const token = getToken();

    const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
    const isPublicRoute = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

    const shouldRedirectToLogin = isProtectedRoute && !token;
    const shouldRedirectToHome = isPublicRoute && !!token;
    const checking = shouldRedirectToLogin || shouldRedirectToHome;

    useEffect(() => {
        if (shouldRedirectToLogin) {
            router.replace(ROUTES.LOGIN);
            return;
        }

        if (shouldRedirectToHome) {
            router.replace(ROUTES.HOME);
        }
    }, [router, shouldRedirectToLogin, shouldRedirectToHome]);

    return checking;
}