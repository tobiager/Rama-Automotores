import { NextRequest, NextResponse } from 'next/server'

interface SearchResult {
  pageNumber: number
  text: string
  context: string
}

interface SearchResponse {
  results: SearchResult[]
  totalResults: number
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    const { query, pdfUrl } = await request.json()

    if (!query || !pdfUrl) {
      return NextResponse.json(
        { error: 'Query and PDF URL are required' },
        { status: 400 }
      )
    }

    console.log('Searching for:', query, 'in PDF:', pdfUrl)

    // Mock search results for demonstration
    // In a real implementation, you would use PDF.js or similar to parse the PDF
    const mockResults: SearchResult[] = [
      {
        pageNumber: 12,
        text: query.toUpperCase(),
        context: `Encontrado: ${query.toUpperCase()} - SEDAN 1.6 16V - Precio: $25.450.000`
      },
      {
        pageNumber: 15,
        text: query.toUpperCase(),
        context: `Encontrado: ${query.toUpperCase()} - HATCHBACK 1.4 - Precio: $22.890.000`
      },
      {
        pageNumber: 18,
        text: query.toUpperCase(),
        context: `Encontrado: ${query.toUpperCase()} - SPORT 2.0 - Precio: $28.750.000`
      }
    ].filter(result => 
      result.text.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes('focus') ||
      query.toLowerCase().includes('corolla') ||
      query.toLowerCase().includes('gol') ||
      query.toLowerCase().includes('cronos')
    )

    const response: SearchResponse = {
      results: mockResults,
      totalResults: mockResults.length,
      message: mockResults.length > 0 
        ? `Se encontraron ${mockResults.length} coincidencias`
        : `No se encontraron coincidencias para "${query}"`
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in search-pdf API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
