import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "../components/navbar"
import Footer from "../components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Rama Automotores - Compra y Venta de Vehículos Premium",
  description:
    "Concesionaria especializada en la intermediación de compra y venta de vehículos premium. Tu socio de confianza en el mundo automotor.",
  keywords: "autos, venta, compra, vehículos, concesionaria, premium, usados",
  authors: [{ name: "Rama Automotores" }],
  openGraph: {
    title: "Rama Automotores - Vehículos Premium",
    description: "Encuentra tu próximo vehículo con nosotros",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-900 text-white min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
