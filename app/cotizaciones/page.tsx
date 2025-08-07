"use client"

import { useState, useEffect } from "react"
import { getLastCotizacionUrl } from "@/lib/uploadCotizacion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, FileText, Download, AlertCircle } from 'lucide-react'

interface SearchResult {
  pageNumber: number
  text: string
  context: string
}

export default function CotizacionesPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPdfUrl()
  }, [])

  const loadPdfUrl = async () => {
    setLoading(true)
    setError(null)

    try {
      const url = await getLastCotizacionUrl()
      if (url) {
        setPdfUrl(url)
      } else {
        setError("No hay cotizaciones disponibles")
      }
    } catch (err) {
      setError("Error al cargar la cotización")
      console.error("Error loading PDF URL:", err)
    } finally {
      setLoading(false)
    }
  }

  const searchInPdf = async () => {
    if (!searchTerm.trim()) return

    setSearching(true)
    setSearchResults([])
    setError(null)

    try {
      // Placeholder search implementation
      // In a real implementation, this would search through the PDF content
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate search delay
      
      // Mock search results
      const mockResults: SearchResult[] = [
        {
          pageNumber: 1,
          text: `Resultado de búsqueda para "${searchTerm}"`,
          context: `Este es un resultado de ejemplo para la búsqueda de "${searchTerm}". En una implementación real, esto mostraría el contenido real del PDF.`
        }
      ]

      setSearchResults(mockResults)

      if (mockResults.length === 0) {
        setError(`No se encontraron resultados para "${searchTerm}"`)
      }
    } catch (err) {
      console.error("Error searching PDF:", err)
      setError("Error al buscar en el PDF")
    } finally {
      setSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchInPdf()
    }
  }

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text

    const regex = new RegExp(`(${term})`, "gi")
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando cotización...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Cotizaciones de Autos</h1>
        <p className="text-gray-600 dark:text-gray-400">Busca modelos específicos en nuestra cotización mensual</p>
      </div>

      {/* Buscador */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Modelo
          </CardTitle>
          <CardDescription>Ingresa el modelo de auto que buscas (ej: "Toyota Etios", "Ford Ka")</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Buscar modelo de auto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={searchInPdf} disabled={searching || !searchTerm.trim()}>
              {searching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Resultados de búsqueda */}
      {searchResults.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Resultados de Búsqueda</CardTitle>
            <CardDescription>
              Se encontraron {searchResults.length} resultado(s) para "{searchTerm}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((result, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Página {result.pageNumber}</span>
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {highlightSearchTerm(result.context, searchTerm)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Visor de PDF */}
      {pdfUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Cotización Completa
              </span>
              <Button variant="outline" size="sm" onClick={() => window.open(pdfUrl, "_blank")}>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
            </CardTitle>
            <CardDescription>Puedes navegar por todo el documento usando los controles del visor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <iframe 
                src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-[800px] border rounded-lg" 
                title="Cotización PDF"
                loading="lazy"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {!pdfUrl && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No hay cotizaciones disponibles
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Actualmente no hay cotizaciones cargadas en el sistema.
            </p>
            <Button onClick={loadPdfUrl}>
              Intentar nuevamente
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
