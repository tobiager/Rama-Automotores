"use client"

import Link from "next/link"

export default function NotFound() {
  return (
    <div>
      <main className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl text-gray-300 mb-8">Página no encontrada</h2>
          <p className="text-gray-400 mb-8">La página que buscas no existe o ha sido movida.</p>
          <Link
            href="/"
            className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  )
}
