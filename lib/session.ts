/** Clave usada para almacenar el token en sessionStorage. */
const TOKEN_KEY = "user_token";
const SESSION_COOKIE = "user_session";

/**
 * Obtiene el token de sesión almacenado en sessionStorage.
 * @returns El token si existe, null si no hay sesión activa o si se ejecuta fuera del navegador.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Guarda el token de sesión en sessionStorage y setea cookie para el middleware.
 * @param token - Token a almacenar.
 */
export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${SESSION_COOKIE}=1; path=/; SameSite=Strict`;
}

/**
 * Elimina el token de sesión de sessionStorage y la cookie.
 */
export function removeToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}
