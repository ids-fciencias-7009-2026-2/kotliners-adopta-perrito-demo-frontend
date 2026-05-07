import axios from 'axios'

/** Instancia base de Axios con la URL del backend configurada en .env.local */
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' }
})

/** Interceptor de request: agrega el token de sesion en el header Authorization antes de cada peticion. */
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('user_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

/** Interceptor de response: si el backend devuelve 401 o 403, limpia la sesion y redirige al login. */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined') {
      const status = error?.response?.status
      if (status === 401 || status === 403) {
        sessionStorage.removeItem('user_token')
        sessionStorage.removeItem('usuario')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
