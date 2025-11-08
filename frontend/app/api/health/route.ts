import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    const response = await fetch(`${apiUrl}/health`)
    const data = await response.json()
    
    return NextResponse.json({
      frontend: 'ok',
      backend: data
    })
  } catch (error) {
    return NextResponse.json({
      frontend: 'ok',
      backend: 'error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

