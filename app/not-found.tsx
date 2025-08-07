'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="pb-4">
          <div className="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Search className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Página no encontrada
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          
          <div className="space-y-3">
            <Button 
              onClick={handleGoBack}
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver atrás
            </Button>
            
            <Button asChild className="w-full flex items-center justify-center gap-2">
              <Link href="/">
                <Home className="w-4 h-4" />
                Ir al inicio
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="w-full">
              <Link href="/autos">
                Ver autos disponibles
              </Link>
            </Button>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ¿Necesitas ayuda? <Link href="/contacto" className="text-blue-600 dark:text-blue-400 hover:underline">Contáctanos</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
