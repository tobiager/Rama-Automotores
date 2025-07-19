export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <p className="text-xl text-gray-400 mb-8">Página no encontrada</p>
        <a href="/" className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors">
          Volver al inicio
        </a>
      </div>
    </main>
  )
}
