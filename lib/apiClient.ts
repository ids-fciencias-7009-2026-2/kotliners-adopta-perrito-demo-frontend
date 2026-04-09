/** URL base del backend, configurada en .env.local */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/**
 * Resultado genérico de una llamada al API.
 * - `ok: true`  → la petición fue exitosa y `data` contiene la respuesta.
 * - `ok: false` → ocurrió un error y `error` contiene el mensaje descriptivo.
 */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Rol del usuario en el sistema.
 * Debe coincidir con el enum Rol.kt del backend.
 */
export type Rol = "ADOPTANTE" | "CUIDADOR";

/** Atributos del usuario devueltos por GET /usuarios/me */
export interface Usuario {
  id: number | null;
  curp: string;
  username: string;
  rol: Rol;
  fotoPerfil: string | null;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  codigoPostal: string;
}

/** Payload para POST /usuarios/register */
export interface RegistroPayload {
  nombres: string;
  curp: string;
  username: string;
  rol: Rol;
  fotoPerfil?: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  codigoPostal: string;
  password: string;
}

/** Payload para POST /usuarios/login */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Payload para PUT /usuarios */
export interface ActualizarPerfilPayload {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  codigoPostal: string;
  fotoPerfil?: string;
}

// ---------------------------------------------------------------------------
// Utilidad interna
// ---------------------------------------------------------------------------

/**
 * Construye los headers comunes para las peticiones JSON.
 * @param token - Token de autenticación (opcional, solo para endpoints protegidos)
 * @returns Objeto de headers HTTP
 */
export function buildHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    // El backend espera el formato: Authorization: Bearer <token>
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Procesa la respuesta de fetch y la convierte en ApiResult.
 * - HTTP 401/403 → error especial "SESSION_EXPIRED"
 * - Otros errores HTTP → texto del cuerpo de la respuesta
 * @param response - Respuesta de fetch
 */
async function handleResponse<T>(response: Response): Promise<ApiResult<T>> {
  if (response.ok) {
    // Algunos endpoints pueden no devolver cuerpo JSON
    const text = await response.text();
    const data = text ? (JSON.parse(text) as T) : ({} as T);
    return { ok: true, data };
  }

  if (response.status === 401 || response.status === 403) {
    return { ok: false, error: "SESSION_EXPIRED" };
  }

  const errorText = await response.text();
  return { ok: false, error: errorText || `Error ${response.status}` };
}

// ---------------------------------------------------------------------------
// Funciones del API
// ---------------------------------------------------------------------------

/**
 * Registra un nuevo usuario en el sistema.
 * Endpoint: POST /usuarios/register
 * @param body - Datos del nuevo usuario
 */
export async function registrarUsuario(
  body: RegistroPayload
): Promise<ApiResult<void>> {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/register`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<void>(response);
  } catch {
    return { ok: false, error: "El servicio no está disponible. Intenta más tarde." };
  }
}

/**
 * Autentica al usuario con email y contraseña, devuelve el token de sesión.
 * Endpoint: POST /usuarios/login
 * @param body - Credenciales del usuario (email + password)
 */
export async function loginUsuario(
  body: LoginPayload
): Promise<ApiResult<{ token: string }>> {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/login`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<{ token: string }>(response);
  } catch {
    return { ok: false, error: "El servicio no está disponible. Intenta más tarde." };
  }
}

/**
 * Cierra la sesión del usuario autenticado.
 * Endpoint: POST /usuarios/logout
 * @param token - Token de autenticación activo
 */
export async function logoutUsuario(
  token: string
): Promise<ApiResult<void>> {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/logout`, {
      method: "POST",
      headers: buildHeaders(token),
    });
    return handleResponse<void>(response);
  } catch {
    return { ok: false, error: "El servicio no está disponible. Intenta más tarde." };
  }
}

/**
 * Obtiene la información del usuario autenticado.
 * Endpoint: GET /usuarios/me
 * @param token - Token de autenticación activo
 */
export async function obtenerPerfil(
  token: string
): Promise<ApiResult<Usuario>> {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/me`, {
      method: "GET",
      headers: buildHeaders(token),
    });
    return handleResponse<Usuario>(response);
  } catch {
    return { ok: false, error: "El servicio no está disponible. Intenta más tarde." };
  }
}

/**
 * Actualiza la información del usuario autenticado.
 * Endpoint: PUT /usuarios
 * @param token - Token de autenticación activo
 * @param body - Campos a actualizar
 */
export async function actualizarPerfil(
  token: string,
  body: ActualizarPerfilPayload
): Promise<ApiResult<Usuario>> {
  try {
    const response = await fetch(`${BASE_URL}/usuarios`, {
      method: "PUT",
      headers: buildHeaders(token),
      body: JSON.stringify(body),
    });
    return handleResponse<Usuario>(response);
  } catch {
    return { ok: false, error: "El servicio no está disponible. Intenta más tarde." };
  }
}
