import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col justify-center items-center text-center">
      <h1 className="text-6xl font-bold text-white mb-4">404</h1>
      <p className="text-gray-400 mb-4">La página que buscas no existe o ha sido movida.</p>
      <Link
        href="/"
        className="inline-block bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
      >
        Volver al inicio
      </Link>
    </div>
  )
}
