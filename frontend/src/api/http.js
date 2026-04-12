import axios from 'axios'
import { clearStoredAuth, getStoredAccessToken } from '../auth/authStorage.js'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

http.interceptors.request.use((config) => {
  const token = getStoredAccessToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearStoredAuth()
    }
    return Promise.reject(err)
  },
)

export default http
