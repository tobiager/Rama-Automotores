"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { uploadCotizacionPDF, getAllCotizaciones, type Cotizacion } from "@/lib/cotizaciones"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, FileText, Calendar, CheckCircle, XCircle, Clock } from "lucide-react"

export default function CotizacionesManagerPage() {
  const [file, setFile] = useState<File | null>(null)
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1)
  const [anio, setAnio] = useState<number>(new Date().getFullYear())
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([])
  const [loadingCotizaciones, setLoadingCotizaciones] = useState(true)
  const [processingProgress, setProcessingProgress] = useState(0)

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
    setCotizaciones(data)
    setLoadingCotizaciones(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile)
      setError(null)
    } else {
      setError("Por favor selecciona un archivo PDF válido")
      setFile(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor selecciona un archivo")
      return
    }

    setUploading(true)
    setProcessing(false)
    setError(null)
    setSuccess(null)
    setProcessingProgress(0)

    try {
      // Subir archivo
      const uploadResult = await uploadCotizacionPDF(file, mes, anio)

      if (!uploadResult.success) {
        setError(uploadResult.error || "Error al subir el archivo")
        setUploading(false)
        return
      }

      setUploading(false)
      setProcessing(true)
      setProcessingProgress(25)

      // Procesar PDF
      const response = await fetch("/api/process-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cotizacionId: uploadResult.cotizacionId,
          pdfUrl: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cotizaciones-pdf/${file.name}`,
        }),
      })

      setProcessingProgress(75)

      const processResult = await response.json()

      if (processResult.success) {
        setProcessingProgress(100)
        setSuccess(`Cotización procesada exitosamente. Se extrajeron ${processResult.modelosCount} modelos.`)
        setFile(null)
        const fileInput = document.getElementById("file-input") as HTMLInputElement
        if (fileInput) fileInput.value = ""
        await loadCotizaciones()
      } else {
        setError(processResult.error || "Error al procesar el PDF")
      }
    } catch (err) {
      console.error("Error:", err)
      setError("Error inesperado durante el procesamiento")
    } finally {
      setUploading(false)
      setProcessing(false)
      setProcessingProgress(0)
    }
  }

  const getMesNombre = (mesNum: number) => {
    return meses.find((m) => m.value === mesNum)?.label || mesNum.toString()
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "completado":
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completado
          </Badge>
        )
      case "procesando":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Procesando
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Cotizaciones</h1>
        <p className="text-gray-600">
          Sube PDFs de cotizaciones mensuales y extrae automáticamente los modelos y precios
        </p>
      </div>

      {/* Formulario de subida */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Nueva Cotización
          </CardTitle>
          <CardDescription>El sistema extraerá automáticamente los modelos y precios del PDF</CardDescription>
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

          {(uploading || processing) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  {uploading ? "Subiendo archivo..." : "Procesando PDF y extrayendo modelos..."}
                </span>
              </div>
              {processing && <Progress value={processingProgress} className="w-full" />}
            </div>
          )}

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

          <Button onClick={handleUpload} disabled={uploading || processing || !file} className="w-full md:w-auto">
            {uploading || processing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploading ? "Subiendo..." : "Procesando..."}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Subir y Procesar
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de cotizaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Cotizaciones Procesadas
          </CardTitle>
          <CardDescription>Historial de todas las cotizaciones subidas</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingCotizaciones ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Cargando cotizaciones...
            </div>
          ) : cotizaciones.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay cotizaciones procesadas</p>
          ) : (
            <div className="space-y-3">
              {cotizaciones.map((cotizacion) => (
                <div
                  key={cotizacion.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium">
                        {getMesNombre(cotizacion.mes)} {cotizacion.anio}
                      </p>
                      <p className="text-sm text-gray-500">{cotizacion.nombre_archivo}</p>
                      <p className="text-xs text-gray-400">
                        Subido el {new Date(cotizacion.fecha_subida).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getEstadoBadge(cotizacion.estado)}
                    {cotizacion.estado === "completado" && (
                      <span className="text-sm text-gray-600">{cotizacion.total_modelos} modelos</span>
                    )}
                    <Button variant="outline" size="sm" onClick={() => window.open(cotizacion.url, "_blank")}>
                      Ver PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
