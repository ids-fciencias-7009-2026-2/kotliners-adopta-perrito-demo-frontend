import axios from 'axios'
import sessionEvents from '@/lib/sessionEvents'

/** Instancia base de Axios con la URL del backend configurada en .env.local */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' }
})

/** Interceptor de request: agrega el token de sesión en el header Authorization. */
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('user_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

/**
 * Interceptor de response: si el backend devuelve 401 o 403,
 * emite el evento "session:expired" usando el patron observador.
 * Los componentes suscritos reaccionan limpiando la sesión y redirigiendo.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error?.response?.status
      if (status === 401 || status === 403) {
        sessionEvents.emit('session:expired')
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
