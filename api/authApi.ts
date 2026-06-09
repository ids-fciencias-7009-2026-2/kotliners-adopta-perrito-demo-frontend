/**
 * Funciones para comunicarse con la API de autenticación y usuarios.
 * Usa la instancia de Axios de axios.ts, que agrega el token automaticamente.
 */
import apiClient from './axios'

/** Credenciales para iniciar sesión. */
export interface LoginPayload {
    email: string
    password: string
}

/** Datos para registrar un nuevo usuario. */
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

/** Campos editables del perfil. No incluye curp, username, rol ni password. */
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
 * Ahora retorna { requiere2fa: true, email } si credenciales correctas.
 */
export function login(payload: LoginPayload) {
  return apiClient.post<{ requiere2fa: boolean; email: string }>('/usuarios/login', payload)
}

/**
 * Verifica el código 2FA y obtiene el token de sesión.
 * Endpoint: POST /usuarios/verificar-2fa
 */
export function verificar2fa(email: string, codigo: string) {
  return apiClient.post<{ token: string }>('/usuarios/verificar-2fa', { email, codigo })
}

/**
 * Registra un nuevo usuario en el sistema.
 * Endpoint: POST /usuarios/register
 * @param payload - Datos del nuevo usuario.
 */
export function register(payload: RegistroPayload) {
  return apiClient.post('/usuarios/register', payload)
}

/**
 * Obtiene la información del usuario autenticado.
 * Endpoint: GET /usuarios/me
 * El interceptor agrega el token automaticamente desde sessionStorage.
 */
export function getPerfil() {
  return apiClient.get('/usuarios/me')
}

/**
 * Cierra la sesión del usuario e invalida el token en el backend.
 * Endpoint: POST /usuarios/logout
 * El interceptor agrega el token automaticamente desde sessionStorage.
 */
export function logout() {
  return apiClient.post('/usuarios/logout')
}

/**
 * Actualiza la información del perfil del usuario autenticado.
 * Endpoint: PUT /usuarios
 * El interceptor agrega el token automaticamente desde sessionStorage.
 * @param payload - Campos a actualizar.
 */
export function actualizarPerfil(payload: ActualizarPerfilPayload) {
  return apiClient.put('/usuarios', payload)
}

/**
 * Verifica el correo electrónico con el token enviado al usuario.
 * Endpoint: GET /usuarios/verificar-correo?token=xxx
 */
export function verificarCorreo(token: string) {
  return apiClient.get('/usuarios/verificar-correo', { params: { token } })
}
