"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { uploadCotizacion, getAllCotizaciones } from "@/lib/uploadCotizacion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, FileText, Calendar } from "lucide-react"

interface Cotizacion {
  id: number
  mes: number
  anio: number
  archivo_url: string
  created_at: string
}

export default function AdminCotizacionesPage() {
  const [file, setFile] = useState<File | null>(null)
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1)
  const [anio, setAnio] = useState<number>(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loadingCotizaciones, setLoadingCotizaciones] = useState(true)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const meses = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" },
  ]

  useEffect(() => {
    loadCotizaciones()
  }, [])

  const loadCotizaciones = async () => {
    setLoadingCotizaciones(true)
    const data = await getAllCotizaciones()
    if (data) {
      setCotizaciones(data)
    }
    setLoadingCotizaciones(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setError(null)
      // Crear URL de previsualización
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
    } else {
      setError("Por favor selecciona un archivo PDF válido")
      setFile(null)
      setPreviewUrl(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor selecciona un archivo")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    const result = await uploadCotizacion(file, mes, anio)

    if (result.success) {
      setSuccess(`Cotización de ${meses.find((m) => m.value === mes)?.label} ${anio} subida correctamente`)
      setFile(null)
      setPreviewUrl(null)
      // Limpiar el input
      const fileInput = document.getElementById("file-input") as HTMLInputElement
      if (fileInput) fileInput.value = ""
      // Recargar lista
      await loadCotizaciones()
    } else {
      setError(result.error || "Ocurrió un error al subir la cotización")
    }

    setLoading(false)
  }

  const getMesNombre = (mesNum: number) => {
    return meses.find((m) => m.value === mesNum)?.label || mesNum.toString()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Cotizaciones</h1>
        <p className="text-gray-600">Sube y gestiona los PDFs de cotizaciones mensuales</p>
      </div>

      {/* Formulario de subida */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Nueva Cotización
          </CardTitle>
          <CardDescription>Selecciona el mes, año y archivo PDF de la cotización</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="mes">Mes</Label>
              <Select value={mes.toString()} onValueChange={(value) => setMes(Number.parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el mes" />
                </SelectTrigger>
                <SelectContent>
                  {meses.map((m) => (
                    <SelectItem key={m.value} value={m.value.toString()}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="anio">Año</Label>
              <Input
                type="number"
                value={anio}
                onChange={(e) => setAnio(Number.parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="file-input">Archivo PDF</Label>
            <Input
              id="file-input"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <AlertDescription className="text-green-700">{success}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleUpload} disabled={loading || !file} className="w-full md:w-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Subir Cotización
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Previsualización del PDF */}
      {previewUrl && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Previsualización</CardTitle>
          </CardHeader>
          <CardContent>
            <iframe src={previewUrl} className="w-full h-96 border rounded-lg" title="Previsualización del PDF" />
          </CardContent>
        </Card>
      )}

      {/* Lista de cotizaciones existentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Cotizaciones Existentes
          </CardTitle>
          <CardDescription>Lista de todas las cotizaciones subidas</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCotizaciones ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Cargando cotizaciones...
            </div>
          ) : cotizaciones.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay cotizaciones subidas</p>
          ) : (
            <div className="space-y-3">
              {cotizaciones.map((cotizacion) => (
                <div
                  key={cotizacion.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {getMesNombre(cotizacion.mes)} {cotizacion.anio}
                      </p>
                      <p className="text-sm text-gray-500">
                        Subido el {new Date(cotizacion.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.open(cotizacion.archivo_url, "_blank")}>
                    Ver PDF
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
