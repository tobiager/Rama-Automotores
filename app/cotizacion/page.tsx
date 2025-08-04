"use client";

import { useEffect, useMemo, useState } from "react";
import type React from "react";
import type { Match } from "@react-pdf-viewer/search";

import { getLastCotizacionPdfUrl } from "@/lib/uploadCotizacion";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { searchPlugin } from "@react-pdf-viewer/search";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/search/lib/styles/index.css";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Search, FileText, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CotizacionPage() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const searchPluginInstance = useMemo(() => searchPlugin(), []);
  const searchInstance = useMemo(() => (searchPluginInstance as any).instance, [searchPluginInstance]);
  const store = useMemo(() => (searchPluginInstance as any).store, [searchPluginInstance]);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = await getLastCotizacionPdfUrl();
        if (url) {
          setPdfUrl(url);
        } else {
          setError("No hay cotizaciones disponibles actualmente");
        }
      } catch (err) {
        console.error("Error fetching cotizacion:", err);
        setError("Error al cargar la cotización");
      } finally {
        setLoading(false);
      }
    };
    fetchUrl();
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchInstance.clearHighlights();
      searchInstance.highlight(searchTerm).then(() => {
        if (store.numberOfMatches > 0) {
          searchInstance.jumpToMatch(0);
        }
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleDownload = () => {
    if (pdfUrl) window.open(pdfUrl, "_blank");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Cargando cotización...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Cotización del Mes
          </h1>
          <p className="text-gray-400">Consulta los precios actualizados de todos los modelos de autos</p>
        </div>

        {error ? (
          <Alert className="mb-6 border-red-500/20 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        ) : pdfUrl ? (
          <div className="space-y-6">
            {/* Barra de búsqueda */}
            <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Search className="h-5 w-5 text-blue-400" />
                  Buscar en la cotización
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    type="text"
                    placeholder="Buscar modelo de auto (ej: Toyota Etios, Ford Focus)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                  />
                  <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                </div>

                {searchTerm && (
                  <>
                    <p className="text-sm text-gray-400 mt-3">
                      {store.numberOfMatches === 0
                        ? "No se encontraron coincidencias."
                        : `${store.numberOfMatches} resultado${store.numberOfMatches > 1 ? "s" : ""} encontrado${
                            store.numberOfMatches > 1 ? "s" : ""
                          }.`}
                    </p>
                    {store.numberOfMatches > 0 && (
                      <>
                        <div className="flex gap-2 mt-2">
                          <Button variant="ghost" onClick={() => searchInstance.jumpToPreviousMatch()}>
                            Anterior
                          </Button>
                          <Button variant="ghost" onClick={() => searchInstance.jumpToNextMatch()}>
                            Siguiente
                          </Button>
                        </div>
                        <ul className="mt-3 text-sm text-blue-400 max-h-48 overflow-auto space-y-1">
                          {(store.matches as Match[]).map((_, index: number) => (
                            <li key={index}>
                              <button
                                className="hover:underline"
                                onClick={() => searchInstance.jumpToMatch(index)}
                              >
                                Ir al resultado #{index + 1}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Visor PDF */}
            <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="h-5 w-5 text-green-400" />
                  Cotización Completa
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[80vh] overflow-hidden rounded-b-lg bg-white">
                  <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                    <Viewer fileUrl={pdfUrl} plugins={[searchPluginInstance]} theme="dark" />
                  </Worker>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-gray-700 bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="text-center py-20">
              <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No hay cotizaciones disponibles actualmente</p>
              <p className="text-gray-500 text-sm mt-2">El administrador debe subir una cotización primero</p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
