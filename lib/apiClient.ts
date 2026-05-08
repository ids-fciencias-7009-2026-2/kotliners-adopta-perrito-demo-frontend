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

/** Datos normalizados de un animal usado por las vistas del frontend. */
export interface Animal {
  id: string;
  nombre: string;
  especie: string;
  raza: string | null;
  fechaNacimiento: string | null;
  sexo: string | null;
  descripcion: string | null;
  estatus: string | null;
  esterilizado: boolean;
  codigoPostal: string | null;
  imagenUrl: string | null;
  duenoId: string | null;
  duenoNombre: string | null;
  tieneInteres: boolean;
  fechaRegistro: string | null;
  updatedAt: string | null;
  inapropiado: boolean;
  esDueno: boolean;
  puedeEditar: boolean;
  puedeEliminar: boolean;
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

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function firstValue(source: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key];
  }
  return null;
}

function stringOrNull(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function booleanValue(value: unknown): boolean {
  return value === true || value === "true";
}

function animalPayload(value: unknown): unknown {
  const record = asRecord(value);
  return firstValue(record, ["animal", "data", "detalle"]) ?? value;
}

function animalArrayPayload(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  const record = asRecord(value);
  const nested = firstValue(record, ["animals", "animales", "content", "data"]);
  return nested && nested !== value ? animalArrayPayload(nested) : [];
}

/** Compara IDs aunque el backend los envie como number o string. */
export function sameId(left: unknown, right: unknown): boolean {
  const normalizedLeft = stringOrNull(left);
  const normalizedRight = stringOrNull(right);
  return !!normalizedLeft && !!normalizedRight && normalizedLeft === normalizedRight;
}

/** Convierte respuestas del backend a una forma estable para la UI. */
export function normalizarAnimal(raw: unknown): Animal {
  const source = asRecord(animalPayload(raw));
  const dueno = asRecord(firstValue(source, ["dueno", "owner", "cuidador"]));
  const duenoId = stringOrNull(firstValue(source, ["duenoId", "ownerId", "cuidadorId", "usuarioId"]))
    ?? stringOrNull(firstValue(dueno, ["id", "usuarioId"]));
  const duenoNombre = stringOrNull(firstValue(source, ["duenoNombre", "ownerName", "cuidadorNombre"]))
    ?? stringOrNull(firstValue(dueno, ["username", "nombre", "nombres", "email"]));
  const esDueno = booleanValue(firstValue(source, ["esDueno", "isOwner"]));
  const puedeEditar = firstValue(source, ["puedeEditar", "canEdit"]);
  const puedeEliminar = firstValue(source, ["puedeEliminar", "canDelete"]);

  return {
    id: stringOrNull(firstValue(source, ["id", "animalId"])) ?? "",
    nombre: stringOrNull(firstValue(source, ["nombre", "name"])) ?? "Animal sin nombre",
    especie: stringOrNull(firstValue(source, ["especie", "species", "tipo", "type"])) ?? "Animal",
    raza: stringOrNull(firstValue(source, ["raza", "breed"])),
    fechaNacimiento: stringOrNull(firstValue(source, ["fechaNacimiento", "birthDate", "dateOfBirth"])),
    sexo: stringOrNull(firstValue(source, ["sexo", "sex", "genero", "gender"])),
    descripcion: stringOrNull(firstValue(source, ["descripcion", "description"])),
    estatus: stringOrNull(firstValue(source, ["estatus", "status"])),
    esterilizado: booleanValue(firstValue(source, ["esterilizado", "sterilized"])),
    codigoPostal: stringOrNull(firstValue(source, ["codigoPostal", "zip", "zipCode", "postalCode"])),
    imagenUrl: stringOrNull(firstValue(source, ["imagenUrl", "imageUrl", "fotoUrl", "photoUrl", "imagen", "image"])),
    duenoId,
    duenoNombre,
    tieneInteres: booleanValue(firstValue(source, ["tieneInteres", "hasInterest", "interesado"])),
    fechaRegistro: stringOrNull(firstValue(source, ["fechaRegistro", "createdAt", "created_at"])),
    updatedAt: stringOrNull(firstValue(source, ["updatedAt", "updated_at", "fechaActualizacion"])),
    inapropiado: booleanValue(firstValue(source, ["inapropiado", "inappropriate"])),
    esDueno,
    puedeEditar: puedeEditar === null ? esDueno : booleanValue(puedeEditar),
    puedeEliminar: puedeEliminar === null ? esDueno : booleanValue(puedeEliminar),
  };
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
// Endpoints de animales
// ---------------------------------------------------------------------------

/**
 * Obtiene la lista de animales desde el backend.
 * Endpoint: GET /animals
 * @param token - Token de autenticacion activo.
 */
export async function listarAnimales(token: string): Promise<ApiResult<Animal[]>> {
  try {
    const response = await fetch(`${BASE_URL}/animals`, {
      method: "GET",
      headers: buildHeaders(token),
    });
    const result = await handleResponse<unknown>(response);
    if (!result.ok) return result;
    return {
      ok: true,
      data: animalArrayPayload(result.data)
        .map(normalizarAnimal)
        .filter((animal) => animal.id.length > 0),
    };
  } catch {
    return { ok: false, error: "El servicio no esta disponible. Intenta mas tarde." };
  }
}

/**
 * Obtiene el detalle de un animal.
 * Endpoint: GET /animals/{id}
 * @param token - Token de autenticacion activo.
 * @param animalId - ID del animal a consultar.
 */
export async function obtenerAnimalPorId(token: string, animalId: string): Promise<ApiResult<Animal>> {
  try {
    const response = await fetch(`${BASE_URL}/animals/${encodeURIComponent(animalId)}`, {
      method: "GET",
      headers: buildHeaders(token),
    });
    const result = await handleResponse<unknown>(response);
    if (!result.ok) return result;
    return { ok: true, data: normalizarAnimal(result.data) };
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
