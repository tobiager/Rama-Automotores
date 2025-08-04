import { type NextRequest, NextResponse } from "next/server"
import { processPDFContent } from "@/lib/cotizaciones"
import * as pdfjsLib from "pdfjs-dist"

// Configurar worker de PDF.js para el servidor
pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve("pdfjs-dist/build/pdf.worker.js")

export async function POST(request: NextRequest) {
  try {
    const { cotizacionId, pdfUrl } = await request.json()

    if (!cotizacionId || !pdfUrl) {
      return NextResponse.json({ error: "Faltan parámetros requeridos" }, { status: 400 })
    }

    // Descargar y procesar el PDF
    const response = await fetch(pdfUrl)
    const arrayBuffer = await response.arrayBuffer()

    // Cargar el PDF con PDF.js
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
    let fullText = ""

    // Extraer texto de todas las páginas
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      const pageText = textContent.items.map((item: any) => item.str).join(" ")

      fullText += pageText + "\n"
    }

    // Procesar el contenido extraído
    const result = await processPDFContent(cotizacionId, fullText)

    if (result.success) {
      return NextResponse.json({
        success: true,
        modelosCount: result.modelosCount,
      })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error processing PDF:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
