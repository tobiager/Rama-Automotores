"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs"
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url"

GlobalWorkerOptions.workerSrc = workerSrc

export default function CotizacionesPage() {
  const [query, setQuery] = useState("")
  const [lines, setLines] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPdf = async () => {
      const { data } = await supabase.storage
        .from("cotizaciones-pdf")
        .download("cotizacion-actual.pdf")

      if (data) {
        const pdf = await getDocument({ data: await data.arrayBuffer() }).promise
        const textLines: string[] = []

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i)
          const content = await page.getTextContent()
          content.items.forEach((item: any) => {
            if ("str" in item) textLines.push(item.str)
          })
        }

        setLines(textLines)
      }
      setLoading(false)
    }

    loadPdf()
  }, [])

  const results = query
    ? lines.filter((l) => l.toLowerCase().includes(query.toLowerCase()))
    : []

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Cotizaciones</h1>
      <input
        type="text"
        placeholder="Buscar..."
        className="w-full p-2 border rounded mb-6"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <p>Cargando cotización...</p>}
      {!loading && query && results.length === 0 && (
        <p>No se encontraron resultados.</p>
      )}
      <div className="space-y-2">
        {results.map((line, idx) => (
          <div key={idx} className="p-3 bg-white rounded shadow">
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}

