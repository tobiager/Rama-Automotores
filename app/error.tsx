"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Error</h1>
        <p className="text-gray-400 mb-8">Ha ocurrido un error en esta página.</p>
        <button
          onClick={() => reset()}
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
