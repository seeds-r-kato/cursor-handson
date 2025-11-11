'use client'

import { PixabayImage } from '@/lib/hooks/useImageSearch'
import Image from 'next/image'

interface ImageCardProps {
  image: PixabayImage
  onClick: () => void
}

export default function ImageCard({ image, onClick }: ImageCardProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`${image.tags}の画像を表示`}
    >
      <div className="relative aspect-square">
        <Image
          src={image.previewURL}
          alt={image.tags}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 16vw"
        />
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 truncate">
          {image.user}
        </p>
        <p className="text-xs text-gray-500 truncate mt-1">{image.tags}</p>
      </div>
    </div>
  )
}


