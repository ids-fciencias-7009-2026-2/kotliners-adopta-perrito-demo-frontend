import axios from 'axios'

// Instancia base de Axios
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor de request
// Se ejecuta ANTES de cada petición
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('user_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

export default apiClient
