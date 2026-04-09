const TOKEN_KEY = "user_token";

/**
 * Obtiene el token almacenado en sessionStorage.
 * Retorna null si no existe o si se ejecuta fuera del navegador.
 */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

/**
 * Guarda el token en sessionStorage.
 */
export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

/**
 * Elimina el token de sessionStorage.
 */
export function removeToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}
