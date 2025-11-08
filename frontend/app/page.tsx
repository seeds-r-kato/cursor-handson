'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface HealthResponse {
  status: string
  message: string
  timestamp?: string
}

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await api.get<HealthResponse>('/health')
        setHealthStatus(data)
      } catch (err) {
        console.error('Failed to fetch health status:', err)
        setError('バックエンドとの通信に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    checkHealth()
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Seeds Cursor Handson</h1>
        <p className="text-lg mb-4">Laravel API + Next.js Frontend</p>
        
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Status</h2>
          <p className="text-green-600">✓ Frontend is running</p>
          
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Backend API Status:</h3>
            {loading && <p className="text-yellow-600">⏳ チェック中...</p>}
            {error && <p className="text-red-600">✗ {error}</p>}
            {healthStatus && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-600">✓ Backend is running</p>
                <p className="text-sm text-gray-600 mt-2">
                  Status: {healthStatus.status}
                </p>
                <p className="text-sm text-gray-600">
                  Message: {healthStatus.message}
                </p>
                {healthStatus.timestamp && (
                  <p className="text-sm text-gray-600">
                    Timestamp: {healthStatus.timestamp}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

