import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Rutas que requieren autenticación.
 * El token se guarda en sessionStorage (cliente), así que desde el middleware
 * no podemos validarlo. Pero podemos verificar la cookie de sesión si existiera.
 *
 * Como el proyecto usa sessionStorage (no cookies), este middleware
 * redirige a /login si se accede a una ruta protegida sin la cookie "user_session".
 * El frontend setea esta cookie al hacer login exitoso.
 */
const PROTECTED_PATHS = ["/home", "/profile", "/favoritos", "/explorar", "/mis-mascotas", "/publicar", "/admin"];
const PUBLIC_PATHS = ["/login", "/registro"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.get("user_session");

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Sin cookie de sesión en ruta protegida → redirigir a login
  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Con cookie de sesión en ruta pública → redirigir a home
  if (isPublic && hasSession) {
    const homeUrl = new URL("/home", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/profile/:path*", "/favoritos/:path*", "/explorar/:path*", "/mis-mascotas/:path*", "/publicar/:path*", "/admin/:path*", "/login", "/registro"],
};
