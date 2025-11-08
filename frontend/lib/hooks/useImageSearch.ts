'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface PixabayImage {
  id: number
  pageURL: string
  type: string
  tags: string
  previewURL: string
  previewWidth: number
  previewHeight: number
  webformatURL: string
  webformatWidth: number
  webformatHeight: number
  largeImageURL: string
  imageWidth: number
  imageHeight: number
  imageSize: number
  views: number
  downloads: number
  collections: number
  likes: number
  comments: number
  user_id: number
  user: string
  userImageURL: string | null
}

export interface ImageSearchResponse {
  total: number
  totalHits: number
  hits: PixabayImage[]
}

interface SearchParams {
  q: string
  per_page?: number
  order?: 'latest' | 'popular'
  safesearch?: boolean
}

export function useImageSearch(params: SearchParams | null) {
  return useQuery<ImageSearchResponse>({
    queryKey: ['images', 'search', params],
    queryFn: async () => {
      if (!params) throw new Error('検索パラメータが必要です')
      
      const queryParams = new URLSearchParams({
        q: params.q,
        per_page: String(params.per_page ?? 20),
        order: params.order ?? 'latest',
        safesearch: String(params.safesearch ?? false),
      })
      
      return await api.get<ImageSearchResponse>(`/search/images?${queryParams.toString()}`)
    },
    enabled: !!params && !!params.q,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

