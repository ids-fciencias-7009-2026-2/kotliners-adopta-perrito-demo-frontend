"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "./session";

/**
 * Hook que protege rutas que requieren autenticación.
 * Si no hay token en sessionStorage, redirige al usuario a /login.
 * Debe llamarse al inicio de cada página protegida.
 *
 * @example
 * export default function HomePage() {
 *   useAuthGuard();
 *   return <div>Contenido protegido</div>;
 * }
 */
export function useAuthGuard(): void {
  const router = useRouter();

  useEffect(() => {
    // Si no hay token válido, redirigir a login
    if (!getToken()) {
      router.replace("/login");
    }
  }, [router]);
}
