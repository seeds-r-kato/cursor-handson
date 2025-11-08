'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  name: string
  email: string
}

interface AuthResponse {
  user: User
  token: string
  message: string
}

interface RegisterData {
  name: string
  email: string
  password: string
}

interface LoginData {
  email: string
  password: string
}

// 認証フック
export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // 現在のユーザー情報を取得
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) return null
        return await api.get<User>('/auth/user')
      } catch {
        localStorage.removeItem('auth_token')
        return null
      }
    },
    retry: false,
  })

  // 登録
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await api.post<AuthResponse>('/auth/register', data)
      localStorage.setItem('auth_token', response.token)
      return response
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user)
      router.push('/search')
    },
  })

  // ログイン
  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await api.post<AuthResponse>('/auth/login', data)
      localStorage.setItem('auth_token', response.token)
      return response
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data.user)
      router.push('/search')
    },
  })

  // ログアウト
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout')
    },
    onSuccess: () => {
      localStorage.removeItem('auth_token')
      queryClient.setQueryData(['auth', 'user'], null)
      router.push('/login')
    },
  })

  return {
    user,
    isLoading,
    register: registerMutation.mutate,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}

