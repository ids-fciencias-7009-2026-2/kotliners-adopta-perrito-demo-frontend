/** URL base del backend, configurada en .env.local */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

import sessionEvents from "@/lib/sessionEvents";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/**
 * Resultado generico de una llamada al API.
 * - ok: true  — la peticion fue exitosa y data contiene la respuesta.
 * - ok: false — ocurrio un error y error contiene el mensaje descriptivo.
 */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/** Roles disponibles para el usuario. Deben coincidir con el enum Rol.kt del backend. */
export type Rol = "ADOPTANTE" | "CUIDADOR";

/** Datos del usuario devueltos por GET /usuarios/me */
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
// Utilidades internas
// ---------------------------------------------------------------------------

/**
 * Construye los headers HTTP para las peticiones JSON.
 * @param token - Token de autenticacion (opcional, solo para endpoints protegidos).
 * @returns Objeto con los headers necesarios.
 */
export function buildHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    // El backend espera el formato: Authorization: Bearer <token>
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Procesa la respuesta de fetch y la convierte en ApiResult.
 * - HTTP 401/403 devuelve el error especial "SESSION_EXPIRED".
 * - Otros errores HTTP devuelven el texto del cuerpo de la respuesta.
 * @param response - Respuesta de fetch a procesar.
 */
async function handleResponse<T>(response: Response): Promise<ApiResult<T>> {
  if (response.ok) {
    // Algunos endpoints no devuelven cuerpo JSON
    const text = await response.text();
    const data = text ? (JSON.parse(text) as T) : ({} as T);
    return { ok: true, data };
  }
  if (response.status === 401 || response.status === 403) {
    // Emitir evento para que todos los observadores reaccionen
    if (typeof window !== "undefined") sessionEvents.emit("session:expired");
    return { ok: false, error: "SESSION_EXPIRED" };
  }
  const errorText = await response.text();
  return { ok: false, error: errorText || `Error ${response.status}` };
}

// ---------------------------------------------------------------------------
// Endpoints de usuarios
// ---------------------------------------------------------------------------

/**
 * Registra un nuevo usuario en el sistema.
 * Endpoint: POST /usuarios/register
 * @param body - Datos del nuevo usuario.
 */
export async function registrarUsuario(body: RegistroPayload): Promise<ApiResult<void>> {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/register`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<void>(response);
  } catch {
    return { ok: false, error: "El servicio no esta disponible. Intenta mas tarde." };
  }
}

/**
 * Autentica al usuario y devuelve el token de sesion.
 * Endpoint: POST /usuarios/login
 * @param body - Credenciales del usuario (email y password).
 */
export async function loginUsuario(body: LoginPayload): Promise<ApiResult<{ token: string }>> {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/login`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<{ token: string }>(response);
  } catch {
    return { ok: false, error: "El servicio no esta disponible. Intenta mas tarde." };
  }
}

/**
 * Cierra la sesion del usuario autenticado e invalida el token en el backend.
 * Endpoint: POST /usuarios/logout
 * @param token - Token de autenticacion activo.
 */
export async function logoutUsuario(token: string): Promise<ApiResult<void>> {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/logout`, {
      method: "POST",
      headers: buildHeaders(token),
    });
    return handleResponse<void>(response);
  } catch {
    return { ok: false, error: "El servicio no esta disponible. Intenta mas tarde." };
  }
}

/**
 * Obtiene la informacion del usuario autenticado.
 * Endpoint: GET /usuarios/me
 * @param token - Token de autenticacion activo.
 */
export async function obtenerPerfil(token: string): Promise<ApiResult<Usuario>> {
  try {
    const response = await fetch(`${BASE_URL}/usuarios/me`, {
      method: "GET",
      headers: buildHeaders(token),
    });
    return handleResponse<Usuario>(response);
  } catch {
    return { ok: false, error: "El servicio no esta disponible. Intenta mas tarde." };
  }
}

/**
 * Actualiza la informacion del usuario autenticado.
 * Endpoint: PUT /usuarios
 * @param token - Token de autenticacion activo.
 * @param body - Campos a actualizar.
 */
export async function actualizarPerfil(token: string, body: ActualizarPerfilPayload): Promise<ApiResult<Usuario>> {
  try {
    const response = await fetch(`${BASE_URL}/usuarios`, {
      method: "PUT",
      headers: buildHeaders(token),
      body: JSON.stringify(body),
    });
    return handleResponse<Usuario>(response);
  } catch {
    return { ok: false, error: "El servicio no esta disponible. Intenta mas tarde." };
  }
}

// ---------------------------------------------------------------------------
// Endpoints de intereses
// ---------------------------------------------------------------------------

/** Datos de un animal favorito devueltos por GET /api/usuarios/me/intereses */
export interface AnimalInteresResponse {
  animalId: string;
  nombre: string;
  especie: string;
  raza: string | null;
  fechaNacimiento: string;
  sexo: string;
  descripcion: string;
  estatus: string;
  esterilizado: boolean;
  fechaInteres: string;
}

/**
 * Registra el interes del usuario autenticado en un animal.
 * Endpoint: POST /api/animales/{id}/interes
 * @param token - Token de autenticacion activo.
 * @param animalId - ID del animal.
 */
export async function manifestarInteres(token: string, animalId: string): Promise<ApiResult<void>> {
  try {
    const response = await fetch(`${BASE_URL}/api/animales/${animalId}/interes`, {
      method: "POST",
      headers: buildHeaders(token),
    });
    return handleResponse<void>(response);
  } catch {
    return { ok: false, error: "El servicio no esta disponible. Intenta mas tarde." };
  }
}

/**
 * Elimina el interes del usuario autenticado en un animal.
 * Endpoint: DELETE /api/animales/{id}/interes
 * @param token - Token de autenticacion activo.
 * @param animalId - ID del animal.
 */
export async function eliminarInteres(token: string, animalId: string): Promise<ApiResult<void>> {
  try {
    const response = await fetch(`${BASE_URL}/api/animales/${animalId}/interes`, {
      method: "DELETE",
      headers: buildHeaders(token),
    });
    return handleResponse<void>(response);
  } catch {
    return { ok: false, error: "El servicio no esta disponible. Intenta mas tarde." };
  }
}

/**
 * Obtiene la lista de animales favoritos del usuario autenticado.
 * Endpoint: GET /api/usuarios/me/intereses
 * @param token - Token de autenticacion activo.
 */
export async function listarIntereses(token: string): Promise<ApiResult<AnimalInteresResponse[]>> {
  try {
    const response = await fetch(`${BASE_URL}/api/usuarios/me/intereses`, {
      method: "GET",
      headers: buildHeaders(token),
    });
    return handleResponse<AnimalInteresResponse[]>(response);
  } catch {
    return { ok: false, error: "El servicio no esta disponible. Intenta mas tarde." };
  }
}

// ---------------------------------------------------------------------------
// Subida de imagenes
// ---------------------------------------------------------------------------

/**
 * Sube una imagen de perfil al backend y devuelve la URL publica.
 * Endpoint: POST /uploads/foto-perfil
 * @param token - Token de autenticacion activo.
 * @param file - Archivo de imagen a subir.
 */
export async function subirFotoPerfil(token: string, file: File): Promise<ApiResult<{ url: string }>> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${BASE_URL}/uploads/foto-perfil`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
      body: formData,
    });
    return handleResponse<{ url: string }>(response);
  } catch {
    return { ok: false, error: "El servicio no esta disponible. Intenta mas tarde." };
  }
}

// ---------------------------------------------------------------------------
// Endpoints de animales
// ---------------------------------------------------------------------------

/** Datos de un animal del catálogo devueltos por GET /api/animales */
export interface AnimalResponse {
  id: string;
  nombre: string;
  especie: string;
  raza: string | null;
  fechaNacimiento: string;
  sexo: string;
  descripcion: string;
  estatus: string;
  esterilizado: boolean;
  usuarioId: string;
  fechaRegistro: string;
}

/** Payload para POST /api/animales */
export interface CreateAnimalPayload {
  nombre: string;
  especie: string;
  raza?: string;
  fechaNacimiento: string;
  sexo: "MACHO" | "HEMBRA";
  descripcion: string;
  esterilizado: boolean;
}

/**
 * Obtiene la lista de todos los animales disponibles.
 * Endpoint: GET /api/animales
 * @param token - Token de autenticación (opcional).
 */
export async function listarAnimales(token?: string): Promise<ApiResult<AnimalResponse[]>> {
  try {
    const response = await fetch(`${BASE_URL}/api/animales`, {
      method: "GET",
      headers: buildHeaders(token),
    });
    return handleResponse<AnimalResponse[]>(response);
  } catch {
    return { ok: false, error: "El servicio no esta disponible. Intenta mas tarde." };
  }
}

/**
 * Publica un nuevo animal en el catálogo.
 * Endpoint: POST /api/animales
 * @param token - Token de autenticación activo.
 * @param body - Datos del nuevo animal.
 */
export async function publicarAnimal(token: string, body: CreateAnimalPayload): Promise<ApiResult<AnimalResponse>> {
  try {
    const response = await fetch(`${BASE_URL}/api/animales`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(body),
    });
    return handleResponse<AnimalResponse>(response);
  } catch {
    return { ok: false, error: "El servicio no esta disponible. Intenta mas tarde." };
  }
}

/**
 * Obtiene el detalle de un animal por su ID.
 * Endpoint: GET /api/animales/{id}
 */
export async function obtenerAnimal(
  id: string,
  token?: string
): Promise<ApiResult<AnimalResponse>> {
  try {
    const response = await fetch(`${BASE_URL}/api/animales/${id}`, {
      method: "GET",
      headers: buildHeaders(token),
    });
    return handleResponse<AnimalResponse>(response);
  } catch {
    return { ok: false, error: "El servicio no esta disponible. Intenta mas tarde." };
  }
}
