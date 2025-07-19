"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Car } from "lucide-react"
import { Button } from "@/components/ui/button" // Importar Button

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Car className="h-8 w-8 text-gray-300" />
            <span className="text-xl font-bold text-white">Rama Automotores</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Inicio
            </Link>
            <Link href="/autos" className="text-gray-300 hover:text-white transition-colors">
              Autos en Venta
            </Link>
            <Link href="/vendidos" className="text-gray-300 hover:text-white transition-colors">
              Vendidos
            </Link>
            <Link href="/contacto" className="text-gray-300 hover:text-white transition-colors">
              Contacto
            </Link>
            <Link href="/admin" passHref legacyBehavior>
              <Button className="bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-2 transition-colors">Admin</Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/95">
              <Link href="/" className="block px-3 py-2 text-gray-300 hover:text-white">
                Inicio
              </Link>
              <Link href="/autos" className="block px-3 py-2 text-gray-300 hover:text-white">
                Autos en Venta
              </Link>
              <Link href="/vendidos" className="block px-3 py-2 text-gray-300 hover:text-white">
                Vendidos
              </Link>
              <Link href="/contacto" className="block px-3 py-2 text-gray-300 hover:text-white">
                Contacto
              </Link>
              <Link href="/admin" passHref legacyBehavior>
                <Button className="block w-full text-left bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                  Admin
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
