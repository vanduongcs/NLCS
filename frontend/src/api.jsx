import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:2025/api',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
})

// Request interceptor để thêm token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor để handle errors tốt hơn
API.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Enhance error information
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      error.isTimeout = true
      error.message = 'Network timeout'
    } else if (!error.response) {
      error.isNetworkError = true
      error.message = 'Network Error'
    }
    
    return Promise.reject(error)
  }
)

export default API