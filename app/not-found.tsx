'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 text-6xl font-bold text-gray-400 dark:text-gray-600">
            404
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Página no encontrada
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleGoBack}
              variant="outline" 
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
            
            <Button 
              asChild 
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                Inicio
              </Link>
            </Button>
          </div>
          
          <Button 
            asChild 
            variant="ghost" 
            className="w-full flex items-center justify-center gap-2"
          >
            <Link href="/autos">
              <Search className="h-4 w-4" />
              Ver todos los autos
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
