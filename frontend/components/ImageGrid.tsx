'use client'

import { ReactNode } from 'react'

interface ImageGridProps {
  children: ReactNode
}

export default function ImageGrid({ children }: ImageGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {children}
    </div>
  )
}

