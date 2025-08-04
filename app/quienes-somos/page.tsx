import Image from "next/image"
import { Shield, Zap, Eye } from "lucide-react"

export default function QuienesSomosPage() {
  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      <section className="relative h-64 sm:h-80">
        <Image
          src="https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80"
          alt="Nuestro equipo"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold">Quiénes Somos</h1>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <p className="text-lg text-gray-300">
          Rama Automotores nace en Resistencia, Chaco, con la misión de conectar a compradores y vendedores de vehículos de manera segura y transparente. Con años de experiencia en el mercado, somos el intermediario confiable que facilita cada paso de la operación.
        </p>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg text-center hover-lift">
            <Shield className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Confianza</h3>
            <p className="text-gray-400">Procesos claros y acompañamiento en cada etapa.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center hover-lift">
            <Zap className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Rapidez</h3>
            <p className="text-gray-400">Gestionamos la operación de forma ágil para que obtengas resultados pronto.</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg text-center hover-lift">
            <Eye className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">Transparencia</h3>
            <p className="text-gray-400">Información clara y sin sorpresas ocultas.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
