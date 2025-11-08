'use client'

import { useState } from 'react'
import { useImageSearch, PixabayImage } from '@/lib/hooks/useImageSearch'
import { useAuth } from '@/lib/hooks/useAuth'
import ImageModal from '@/components/ImageModal'
import ImageCard from '@/components/ImageCard'
import ImageGrid from '@/components/ImageGrid'

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchParams, setSearchParams] = useState<{
    q: string
    per_page: number
    order: 'latest' | 'popular'
    safesearch: boolean
  } | null>(null)
  const [selectedImage, setSelectedImage] = useState<PixabayImage | null>(null)
  const { user, logout, isLoggingOut } = useAuth()
  const { data, isLoading, error, refetch } = useImageSearch(searchParams)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setSearchParams({
        q: searchQuery.trim(),
        per_page: 20,
        order: 'latest',
        safesearch: false,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Pixabay画像検索</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}さん</span>
              <button
                onClick={() => logout()}
                disabled={isLoggingOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {isLoggingOut ? 'ログアウト中...' : 'ログアウト'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="画像を検索..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !searchQuery.trim()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '検索中...' : '検索'}
            </button>
          </div>
        </form>

        {/* Results */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">
              エラーが発生しました。もう一度お試しください。
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              再試行
            </button>
          </div>
        )}

        {data && (
          <div className="mb-6">
            <p className="text-gray-600">
              {data.totalHits}件の画像が見つかりました（全{data.total}件）
            </p>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-200 animate-pulse rounded-lg aspect-square"
              />
            ))}
          </div>
        )}

        {data && data.hits.length > 0 && (
          <ImageGrid>
            {data.hits.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onClick={() => setSelectedImage(image)}
              />
            ))}
          </ImageGrid>
        )}

        {data && data.hits.length === 0 && searchParams && (
          <div className="text-center py-12">
            <p className="text-gray-600">画像が見つかりませんでした</p>
          </div>
        )}

        {!searchParams && (
          <div className="text-center py-12">
            <p className="text-gray-600">検索キーワードを入力してください</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedImage && (
        <ImageModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  )
}
