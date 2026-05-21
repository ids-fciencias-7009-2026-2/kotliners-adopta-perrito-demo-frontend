/**
 * Cliente HTTP centralizado usando Axios.
 * Todas las peticiones al backend pasan por este módulo.
 * El interceptor de api/axios.ts agrega el token automáticamente
 * y maneja errores 401/403 emitiendo el evento session:expired.
 */
import axios from "axios";
import sessionEvents from "@/lib/sessionEvents";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Instancia Axios configurada con baseURL e interceptores */
const http = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/** Interceptor de request: agrega el token desde sessionStorage */
http.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("user_token");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

/** Interceptor de response: emite session:expired en 401/403 */
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if ((status === 401 || status === 403) && typeof window !== "undefined") {
      sessionEvents.emit("session:expired");
    }
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export type Rol = "ADOPTANTE" | "CUIDADOR";

export interface Usuario {
  id: string | null;
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

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ActualizarPerfilPayload {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  codigoPostal: string;
  fotoPerfil?: string;
}

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
  fotoPortada: string | null;
  fechaRegistro: string | null;
}

export interface InteresResponse {
  usuarioId: string;
  animalId: string;
  fecha: string;
  advertencia: string | null;
}

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
  fotoPortada: string | null;
  numInteresados: number;
}

export interface AnimalDetalleResponse extends AnimalResponse {
  fotos: string[];
  vacunas: string[];
  padecimientos: string[];
  numInteresados: number;
}

export interface CreateAnimalPayload {
  nombre: string;
  especie: string;
  raza?: string;
  fechaNacimiento: string;
  sexo: "MACHO" | "HEMBRA";
  descripcion: string;
  esterilizado: boolean;
}

export interface UpdateAnimalPayload {
  nombre: string;
  especie: string;
  raza?: string;
  fechaNacimiento: string;
  sexo: "MACHO" | "HEMBRA";
  descripcion: string;
  estatus: "DISPONIBLE" | "ADOPTADO";
  inapropiado: boolean;
  esterilizado: boolean;
}

export interface DeleteAnimalPayload {
  animalId: string;
}

// ---------------------------------------------------------------------------
// Helper interno
// ---------------------------------------------------------------------------

/** Convierte una respuesta Axios exitosa o un error en ApiResult */
async function call<T>(fn: () => Promise<{ data: T }>): Promise<ApiResult<T>> {
  try {
    const res = await fn();
    return { ok: true, data: res.data };
  } catch (err: any) {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      return { ok: false, error: "SESSION_EXPIRED" };
    }
    const msg =
      err?.response?.data
        ? typeof err.response.data === "string"
          ? err.response.data
          : JSON.stringify(err.response.data)
        : "El servicio no esta disponible. Intenta mas tarde.";
    return { ok: false, error: msg };
  }
}

// ---------------------------------------------------------------------------
// Usuarios
// ---------------------------------------------------------------------------

export const registrarUsuario = (body: RegistroPayload) =>
  call<void>(() => http.post("/usuarios/register", body));

export const loginUsuario = (body: LoginPayload) =>
  call<{ token: string }>(() => http.post("/usuarios/login", body));

export const logoutUsuario = (token: string) =>
  call<void>(() => http.post("/usuarios/logout", {}, { headers: { Authorization: `Bearer ${token}` } }));

export const obtenerPerfil = (token: string) =>
  call<Usuario>(() => http.get("/usuarios/me", { headers: { Authorization: `Bearer ${token}` } }));

export const actualizarPerfil = (token: string, body: ActualizarPerfilPayload) =>
  call<Usuario>(() => http.put("/usuarios", body, { headers: { Authorization: `Bearer ${token}` } }));

// ---------------------------------------------------------------------------
// Intereses
// ---------------------------------------------------------------------------

export const manifestarInteres = (token: string, animalId: string) =>
  call<InteresResponse>(() =>
    http.post(`/api/animales/${animalId}/interes`, {}, { headers: { Authorization: `Bearer ${token}` } })
  );

export const eliminarInteres = (token: string, animalId: string) =>
  call<void>(() =>
    http.delete(`/api/animales/${animalId}/interes`, { headers: { Authorization: `Bearer ${token}` } })
  );

export const listarIntereses = (token: string) =>
  call<AnimalInteresResponse[]>(() =>
    http.get("/api/usuarios/me/intereses", { headers: { Authorization: `Bearer ${token}` } })
  );

// ---------------------------------------------------------------------------
// Imagenes
// ---------------------------------------------------------------------------

export async function subirFotoPerfil(token: string, file: File): Promise<ApiResult<{ url: string }>> {
  const formData = new FormData();
  formData.append("file", file);
  return call<{ url: string }>(() =>
    http.post("/uploads/foto-perfil", formData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    })
  );
}

export async function subirFotoAnimal(token: string, animalId: string, file: File): Promise<ApiResult<{ url: string }>> {
  const formData = new FormData();
  formData.append("file", file);
  return call<{ url: string }>(() =>
    http.post(`/api/animales/${animalId}/fotos`, formData, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
    })
  );
}

export const eliminarFotoAnimal = (token: string, animalId: string, url: string) =>
  call<void>(() =>
    http.delete(`/api/animales/${animalId}/fotos`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { url },
    })
  );

// ---------------------------------------------------------------------------
// Animales
// ---------------------------------------------------------------------------

export interface FiltrosAnimales {
  especie?: string;
  sexo?: string;
  esterilizado?: boolean;
  codigoPostal?: string;
  vacuna?: string;
  sinPadecimientos?: boolean;
  ordenar?: string;
}

export const listarAnimales = (token?: string, filtros?: FiltrosAnimales) =>
  call<AnimalResponse[]>(() => {
    const params: Record<string, string> = {};
    if (filtros?.especie) params.especie = filtros.especie;
    if (filtros?.sexo) params.sexo = filtros.sexo;
    if (filtros?.esterilizado !== undefined) params.esterilizado = String(filtros.esterilizado);
    if (filtros?.codigoPostal) params.codigoPostal = filtros.codigoPostal;
    if (filtros?.vacuna) params.vacuna = filtros.vacuna;
    if (filtros?.sinPadecimientos) params.sinPadecimientos = "true";
    if (filtros?.ordenar) params.ordenar = filtros.ordenar;
    return http.get("/api/animales", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      params,
      timeout: 5000,
    });
  });

export const listarMisAnimales = (token: string) =>
  call<AnimalResponse[]>(() =>
    http.get("/api/animales/me", { headers: { Authorization: `Bearer ${token}` } })
  );

export const obtenerAnimal = (id: string, token?: string) =>
  call<AnimalDetalleResponse>(() =>
    http.get(`/api/animales/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  );

export const publicarAnimal = (token: string, body: CreateAnimalPayload) =>
  call<AnimalResponse>(() =>
    http.post("/api/animales", body, { headers: { Authorization: `Bearer ${token}` } })
  );

export const actualizarAnimal = (token: string, id: string, body: UpdateAnimalPayload) =>
  call<AnimalResponse>(() =>
    http.put(`/api/animales/${id}`, body, { headers: { Authorization: `Bearer ${token}` } })
  );

export const eliminarAnimal = (token: string, body: DeleteAnimalPayload) =>
  call<string>(() =>
    http.delete("/api/animales", {
      headers: { Authorization: `Bearer ${token}` },
      data: body,
    })
  );

// ---------------------------------------------------------------------------
// Vacunas y padecimientos
// ---------------------------------------------------------------------------

export const listarVacunas = (token: string) =>
  call<{ id: string; nombre: string }[]>(() =>
    http.get("/api/vacunas", { headers: { Authorization: `Bearer ${token}` } })
  );

export const listarPadecimientos = (token: string) =>
  call<{ id: string; nombre: string }[]>(() =>
    http.get("/api/padecimientos", { headers: { Authorization: `Bearer ${token}` } })
  );

export const actualizarVacunasAnimal = (token: string, animalId: string, nombres: string[]) =>
  call<void>(() =>
    http.put(`/api/animales/${animalId}/vacunas`, nombres, { headers: { Authorization: `Bearer ${token}` } })
  );

export const actualizarPadecimientosAnimal = (token: string, animalId: string, nombres: string[]) =>
  call<void>(() =>
    http.put(`/api/animales/${animalId}/padecimientos`, nombres, { headers: { Authorization: `Bearer ${token}` } })
  );

// Keep buildHeaders exported for any legacy usage
export function buildHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}
