import apiClient from './axios'

export interface LoginPayload {
    email: string
    password: string
}

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

export interface ActualizarPerfilPayload {
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  email: string
  codigoPostal: string
  fotoPerfil?: string
}

export function login(payload: LoginPayload) {
  return apiClient.post<{ token: string }>('/usuarios/login', payload)
}

export function register(payload: RegistroPayload) {
  return apiClient.post('/usuarios/register', payload)
}

export function getPerfil() {
  return apiClient.get('/usuarios/me')
}

export function logout() {
  return apiClient.post('/usuarios/logout')
}

export function actualizarPerfil(payload: ActualizarPerfilPayload) {
  return apiClient.put('/usuarios', payload)
}
