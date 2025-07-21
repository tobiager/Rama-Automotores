"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <main className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Algo salió mal</h1>
            <p className="text-gray-400 mb-8">Ha ocurrido un error inesperado.</p>
            <button
              onClick={() => reset()}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
