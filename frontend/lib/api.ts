import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Axios インスタンスの作成
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // CORS with credentials
})

// リクエストインターセプター（トークン追加）
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// レスポンスインターセプター（エラーハンドリング）
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 認証エラーの場合、トークンを削除
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      }
    }
    if (error.response) {
      // サーバーからエラーレスポンスが返ってきた場合
      console.error('API Error:', error.response.status, error.response.data)
    } else if (error.request) {
      // リクエストは送信されたがレスポンスがない場合
      console.error('Network Error:', error.message)
    } else {
      // その他のエラー
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await axiosInstance.get<T>(endpoint)
    return response.data
  },
  
  post: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    const response = await axiosInstance.post<T>(endpoint, data)
    return response.data
  },
  
  put: async <T>(endpoint: string, data?: unknown): Promise<T> => {
    const response = await axiosInstance.put<T>(endpoint, data)
    return response.data
  },
  
  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await axiosInstance.delete<T>(endpoint)
    return response.data
  },
}

export default axiosInstance

