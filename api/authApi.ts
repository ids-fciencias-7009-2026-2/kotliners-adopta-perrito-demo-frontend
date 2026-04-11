/**
 * Módulo de funciones para comunicarse con la API de autenticación y usuarios.
 * Utiliza la instancia de Axios configurada en axios.ts, que agrega automáticamente
 * el token de sesión en el header Authorization cuando existe en sessionStorage.
 */
import apiClient from './axios'

/** Credenciales necesarias para iniciar sesión. */
export interface LoginPayload {
    email: string
    password: string
}

/** Datos requeridos para registrar un nuevo usuario. */
export interface RegistroPayload {
    nombres: string
    curp: string
    username: string
    rol: string
    apellidoPaterno: string
    apellidoMaterno: string
    email: string
    codigoPostal: string
    password: string
    fotoPerfil?: string
}

/** Campos editables del perfil de usuario. No incluye curp, username, rol ni password. */
export interface ActualizarPerfilPayload {
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  email: string
  codigoPostal: string
  fotoPerfil?: string
}

/**
 * Autentica al usuario con email y contraseña.
 * Endpoint: POST /usuarios/login
 * @returns Token de sesión si las credenciales son correctas.
 */
export function login(payload: LoginPayload) {
  return apiClient.post<{ token: string }>('/usuarios/login', payload)
}

/**
 * Registra un nuevo usuario en el sistema.
 * Endpoint: POST /usuarios/register
 */
export function register(payload: RegistroPayload) {
  return apiClient.post('/usuarios/register', payload)
}

/**
 * Obtiene la información del usuario autenticado.
 * Endpoint: GET /usuarios/me
 * Requiere token en sessionStorage (el interceptor lo agrega automáticamente).
 */
export function getPerfil() {
  return apiClient.get('/usuarios/me')
}

/**
 * Cierra la sesión del usuario autenticado e invalida el token en el backend.
 * Endpoint: POST /usuarios/logout
 * Requiere token en sessionStorage (el interceptor lo agrega automáticamente).
 */
export function logout() {
  return apiClient.post('/usuarios/logout')
}

/**
 * Actualiza la información del perfil del usuario autenticado.
 * Endpoint: PUT /usuarios
 * Requiere token en sessionStorage (el interceptor lo agrega automáticamente).
 */
export function actualizarPerfil(payload: ActualizarPerfilPayload) {
  return apiClient.put('/usuarios', payload)
}
