import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, ArrowLeft, Phone } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card className="bg-gray-800 border-gray-700 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <span className="text-2xl font-bold text-red-600">404</span>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Página no encontrada
            </CardTitle>
            <CardDescription className="text-gray-400">
              Lo sentimos, la página que buscas no existe o ha sido movida.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-3">
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/" className="flex items-center justify-center">
                  <Home className="mr-2 h-4 w-4" />
                  Ir al inicio
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver atrás
              </Button>
              
              <Button 
                variant="ghost" 
                asChild
                className="text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Link href="/contacto" className="flex items-center justify-center">
                  <Phone className="mr-2 h-4 w-4" />
                  Contactar soporte
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
