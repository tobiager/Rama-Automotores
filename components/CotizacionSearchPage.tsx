'use client'

import { useEffect, useState } from 'react'
import { getLastCotizacionUrl } from '../lib/supabase'

export default function CotizacionSearchPage() {
  const [pdfText, setPdfText] = useState('')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const url = await getLastCotizacionUrl()
        if (!url) {
          setError('No se encontró archivo de cotizaciones')
          setLoading(false)
          return
        }

        // Load pdf.js from CDN
        if (typeof window !== 'undefined' && !(window as any).pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
            script.onload = resolve
            script.onerror = reject
            document.head.appendChild(script)
          })
        }

        const pdfjsLib = (window as any).pdfjsLib
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

        const response = await fetch(url)
        const buffer = await response.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
        let text = ''
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          const pageText = content.items.map((item: any) => item.str).join(' ')
          text += pageText + '\n'
        }
        setPdfText(text)
      } catch (err) {
        console.error(err)
        setError('Error al cargar el archivo de cotizaciones')
      } finally {
        setLoading(false)
      }
    }

    loadPdf()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      setResults([])
      return
    }

    const regex = new RegExp(query, 'i')
    const matches = pdfText
      .split('\n')
      .filter((line) => regex.test(line))
      .map((line) => line.trim())
    setResults(matches)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Cotizaciones</h1>
        <form onSubmit={handleSearch} className="flex mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar modelo (ej. Hilux, Onix)"
            className="flex-grow px-4 py-3 bg-gray-800 rounded-l-md focus:outline-none placeholder-gray-400"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-r-md font-semibold"
          >
            Buscar
          </button>
        </form>

        {loading && <p className="text-center">Cargando cotizaciones...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && query && results.length === 0 && (
          <p className="text-center">No se encontraron coincidencias.</p>
        )}

        <ul className="space-y-4">
          {results.map((line, idx) => (
            <li key={idx} className="p-4 bg-gray-800 rounded whitespace-pre-line">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
