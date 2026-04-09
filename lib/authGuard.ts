"use client";

import { useEffect, useState } from "react";
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
export function useAuthGuard(): boolean {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
    } else {
      setChecking(false);
    }
  }, [router]);

  return checking;
}