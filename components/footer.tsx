import Link from "next/link"
import { Phone, Mail, MapPin, Clock } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Info empresa */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">Rama Automotores</h3>
            <p className="text-gray-400">
              Tu intermediario de confianza en la compra y venta de vehículos. Conectamos compradores y
              vendedores con transparencia y profesionalismo.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-blue-400">Inicio</Link></li>
              <li><Link href="/autos" className="text-gray-400 hover:text-blue-400">Autos en Venta</Link></li>
              <li><Link href="/vendidos" className="text-gray-400 hover:text-blue-400">Vendidos</Link></li>
              <li><Link href="/quienes-somos" className="text-gray-400 hover:text-blue-400">Quiénes Somos</Link></li>
              <li><Link href="/contacto" className="text-gray-400 hover:text-blue-400">Contacto</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" />+54 9 3624-607912</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" />info@ramaautomotores.com</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />Resistencia, Chaco</div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5" />
                <div>
                  <div>Lun - Vie: 9:00 - 18:00</div>
                  <div>Sáb: 9:00 - 13:00</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">© 2025 Rama Automotores. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
