'use client'

import { PixabayImage } from '@/lib/hooks/useImageSearch'
import Image from 'next/image'
import { useEffect } from 'react'

interface ImageModalProps {
  image: PixabayImage
  onClose: () => void
}

export default function ImageModal({ image, onClose }: ImageModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
              画像詳細
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-md p-1"
              aria-label="閉じる"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Image */}
          <div className="mb-6">
            <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={image.largeImageURL}
                alt={image.tags}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">作者</h3>
              <p className="text-base text-gray-900">{image.user}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">解像度</h3>
              <p className="text-base text-gray-900">
                {image.imageWidth} × {image.imageHeight} px
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">タグ</h3>
              <p className="text-base text-gray-900">{image.tags}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">統計</h3>
              <div className="text-sm text-gray-900 space-y-1">
                <p>閲覧数: {image.views.toLocaleString()}</p>
                <p>ダウンロード数: {image.downloads.toLocaleString()}</p>
                <p>いいね数: {image.likes.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-4">
            <a
              href={image.pageURL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Pixabayで見る
            </a>
            <a
              href={image.largeImageURL}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              画像をダウンロード
            </a>
          </div>

          {/* Copyright Notice */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600">
              この画像はPixabayから提供されています。使用時はPixabayの利用規約に従ってください。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

