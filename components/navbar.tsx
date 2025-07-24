"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Car } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm border-b border-gray-800 shadow-md z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <Car className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            <span className="text-lg font-semibold text-white">Rama Automotores</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            {["/", "/autos", "/vendidos", "/financiacion", "/quienes-somos", "/contacto"].map((path, i) => (
              <Link
                key={i}
                href={path}
                className="text-gray-300 hover:text-blue-400 transition-colors"
              >
                {["Inicio", "Autos en Venta", "Vendidos", "Financiación", "Quiénes Somos", "Contacto"][i]}
              </Link>
            ))}
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all"
            >
              <Link href="/admin">Admin</Link>
            </Button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden bg-black/95 px-4 py-3 space-y-2">
            {["/", "/autos", "/vendidos", "/quienes-somos", "/contacto"].map((path, i) => (
              <Link
                key={i}
                href={path}
                className="block text-gray-300 hover:text-blue-400 transition-colors"
              >
                {["Inicio", "Autos en Venta", "Vendidos", "Quiénes Somos", "Contacto"][i]}
              </Link>
            ))}
            <Link
              href="/admin"
              className="block w-full text-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-4 py-2 rounded-md shadow-md transition-all"
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
