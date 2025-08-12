"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Calculator, Phone, AlertCircle, CheckCircle } from "lucide-react"
import {
  getCarsForFinancing,
  getTasaForPlazo,
  calcularFinanciacion,
  formatCurrency,
  formatPercentage,
  validateFinanciacionData,
  type CarOption,
  type SimulacionFinanciacion,
} from "@/lib/financiacion"
import { createContact } from "@/lib/supabase"

const PLAZOS_DISPONIBLES = [12, 18, 24, 36, 48, 60]

export default function FinanciacionPage() {
  // Estados del formulario
  const [origenMonto, setOrigenMonto] = useState<"auto" | "libre">("auto")
  const [carsOptions, setCarsOptions] = useState<CarOption[]>([])
  const [selectedCarId, setSelectedCarId] = useState<string>("")
  const [selectedCarPrice, setSelectedCarPrice] = useState<number>(0)
  const [montoLibre, setMontoLibre] = useState<string>("")
  const [anticipo, setAnticipo] = useState<string>("")
  const [plazo, setPlazo] = useState<number>(24)
  const [tasaAnual, setTasaAnual] = useState<number>(45)

  // Estados de la simulación
  const [simulacion, setSimulacion] = useState<SimulacionFinanciacion | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Estados del modal de contacto
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })
  const [sendingContact, setSendingContact] = useState(false)
  const [contactSent, setContactSent] = useState(false)

  // Cargar autos disponibles al montar el componente
  useEffect(() => {
    const loadCars = async () => {
      const cars = await getCarsForFinancing()
      setCarsOptions(cars)
    }
    loadCars()
  }, [])

  // Actualizar tasa cuando cambia el plazo
  useEffect(() => {
    const updateTasa = async () => {
      const tasa = await getTasaForPlazo(plazo)
      setTasaAnual(tasa)
    }
    updateTasa()
  }, [plazo])

  // Manejar selección de auto
  const handleCarSelection = (carId: string) => {
    setSelectedCarId(carId)
    const car = carsOptions.find((c) => c.id === Number.parseInt(carId))
    setSelectedCarPrice(car?.price || 0)
  }

  // Calcular simulación
  const handleCalculate = () => {
    setLoading(true)
    setErrors([])

    const precio = origenMonto === "auto" ? selectedCarPrice : Number.parseFloat(montoLibre) || 0
    const anticipoNum = Number.parseFloat(anticipo) || 0

    // Validar datos
    const validation = validateFinanciacionData(
      origenMonto,
      selectedCarPrice,
      Number.parseFloat(montoLibre) || 0,
      anticipoNum,
      plazo,
    )

    if (!validation.isValid) {
      setErrors(validation.errors)
      setLoading(false)
      return
    }

    // Calcular financiación
    const result = calcularFinanciacion(precio, anticipoNum, plazo, tasaAnual)
    setSimulacion(result)
    setLoading(false)
  }

  // Enviar consulta de contacto
  const handleSendContact = async () => {
    if (!contactForm.name || !contactForm.email) {
      return
    }

    setSendingContact(true)

    try {
      const simulacionDetalle = simulacion
        ? `
Simulación de Financiación:
- Vehículo: ${origenMonto === "auto" ? carsOptions.find((c) => c.id === Number.parseInt(selectedCarId))?.label : `Monto libre: ${formatCurrency(Number.parseFloat(montoLibre))}`}
- Anticipo: ${formatCurrency(simulacion.anticipo)}
- Monto a financiar: ${formatCurrency(simulacion.montoFinanciar)}
- Plazo: ${simulacion.plazo} meses
- Tasa: ${formatPercentage(simulacion.tasaAnual)}
- Cuota mensual: ${formatCurrency(simulacion.cuotaMensual)}
- Total a pagar: ${formatCurrency(simulacion.totalPagar)}

Comentario adicional: ${contactForm.message}
      `
        : contactForm.message

      await createContact({
        name: contactForm.name,
        email: contactForm.email,
        phone: contactForm.phone,
        subject: "Consulta financiación",
        message: simulacionDetalle,
      })

      setContactSent(true)
      setTimeout(() => {
        setShowContactModal(false)
        setContactSent(false)
        setContactForm({ name: "", email: "", phone: "", message: "" })
      }, 2000)
    } catch (error) {
      console.error("Error sending contact:", error)
    } finally {
      setSendingContact(false)
    }
  }

  const canCalculate = () => {
    if (origenMonto === "auto") {
      return selectedCarId && plazo
    } else {
      return montoLibre && Number.parseFloat(montoLibre) >= 500000 && plazo
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Financiación</h1>
          <p className="text-gray-400 text-lg">Simulá tu financiación y conocé tu cuota mensual</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Simulador de Financiación
              </CardTitle>
              <CardDescription>Completá los datos para calcular tu cuota mensual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Origen del monto */}
              <div className="space-y-2">
                <Label>Origen del monto</Label>
                <Select value={origenMonto} onValueChange={(value: "auto" | "libre") => setOrigenMonto(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto publicado</SelectItem>
                    <SelectItem value="libre">Monto libre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Selección de auto o monto libre */}
              {origenMonto === "auto" ? (
                <div className="space-y-2">
                  <Label>Seleccionar vehículo</Label>
                  <Select value={selectedCarId} onValueChange={handleCarSelection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Elegí un vehículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {carsOptions.map((car) => (
                        <SelectItem key={car.id} value={car.id.toString()}>
                          {car.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="monto-libre">Monto del vehículo (ARS)</Label>
                  <Input
                    id="monto-libre"
                    type="number"
                    placeholder="Ej: 5000000"
                    value={montoLibre}
                    onChange={(e) => setMontoLibre(e.target.value)}
                    min="500000"
                    aria-label="Monto del vehículo en pesos argentinos"
                  />
                  <p className="text-sm text-gray-400">Mínimo: $500.000</p>
                </div>
              )}

              {/* Anticipo */}
              <div className="space-y-2">
                <Label htmlFor="anticipo">Anticipo (opcional)</Label>
                <Input
                  id="anticipo"
                  type="number"
                  placeholder="0"
                  value={anticipo}
                  onChange={(e) => setAnticipo(e.target.value)}
                  min="0"
                  aria-label="Anticipo en pesos argentinos"
                />
              </div>

              {/* Plazo */}
              <div className="space-y-2">
                <Label>Plazo de financiación</Label>
                <Select value={plazo.toString()} onValueChange={(value) => setPlazo(Number.parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLAZOS_DISPONIBLES.map((meses) => (
                      <SelectItem key={meses} value={meses.toString()}>
                        {meses} meses
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tasa */}
              <div className="space-y-2">
                <Label>Tasa Nominal Anual (TNA)</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{formatPercentage(tasaAnual)}</Badge>
                  <span className="text-sm text-gray-400">para {plazo} meses</span>
                </div>
              </div>

              {/* Errores */}
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Botón calcular */}
              <Button onClick={handleCalculate} disabled={!canCalculate() || loading} className="w-full" size="lg">
                {loading ? "Calculando..." : "Calcular Financiación"}
              </Button>
            </CardContent>
          </Card>

          {/* Resultados */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle>Resultados de la Simulación</CardTitle>
              <CardDescription>
                Simulación orientativa. Sujeta a verificación y condiciones comerciales.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {simulacion ? (
                <div className="space-y-6">
                  {/* Cuota mensual destacada */}
                  <div className="text-center p-6 bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-400 mb-2">Cuota mensual</p>
                    <p className="text-4xl font-bold text-green-400">{formatCurrency(simulacion.cuotaMensual)}</p>
                    <div className="flex justify-center gap-2 mt-2">
                      <Badge variant="outline">{simulacion.plazo} meses</Badge>
                      <Badge variant="outline">{formatPercentage(simulacion.tasaAnual)} TNA</Badge>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Precio del vehículo</p>
                      <p className="text-lg font-semibold">{formatCurrency(simulacion.precio)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Anticipo</p>
                      <p className="text-lg font-semibold">{formatCurrency(simulacion.anticipo)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Monto a financiar</p>
                      <p className="text-lg font-semibold">{formatCurrency(simulacion.montoFinanciar)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Total a pagar</p>
                      <p className="text-lg font-semibold">{formatCurrency(simulacion.totalPagar)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Intereses totales</p>
                      <p className="text-lg font-semibold text-orange-400">
                        {formatCurrency(simulacion.interesesTotales)}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">TEA equivalente</p>
                      <p className="text-lg font-semibold">{formatPercentage(simulacion.tea)}</p>
                    </div>
                  </div>

                  {/* Botón de contacto */}
                  <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-transparent" variant="outline" size="lg">
                        <Phone className="h-4 w-4 mr-2" />
                        Quiero que me contacten
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-800 border-gray-700">
                      <DialogHeader>
                        <DialogTitle>Solicitar Contacto</DialogTitle>
                        <DialogDescription>
                          Completá tus datos y nos pondremos en contacto para ayudarte con la financiación.
                        </DialogDescription>
                      </DialogHeader>

                      {contactSent ? (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                          <p className="text-lg font-semibold text-green-400">¡Mensaje enviado!</p>
                          <p className="text-gray-400">Te contactaremos pronto.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="contact-name">Nombre completo *</Label>
                            <Input
                              id="contact-name"
                              value={contactForm.name}
                              onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                              placeholder="Tu nombre"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="contact-email">Email *</Label>
                            <Input
                              id="contact-email"
                              type="email"
                              value={contactForm.email}
                              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                              placeholder="tu@email.com"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="contact-phone">Teléfono</Label>
                            <Input
                              id="contact-phone"
                              type="tel"
                              value={contactForm.phone}
                              onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                              placeholder="+54 9 3624-607912"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="contact-message">Comentario adicional</Label>
                            <Textarea
                              id="contact-message"
                              value={contactForm.message}
                              onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                              placeholder="Contanos más sobre tu consulta..."
                              rows={3}
                            />
                          </div>

                          <Button
                            onClick={handleSendContact}
                            disabled={!contactForm.name || !contactForm.email || sendingContact}
                            className="w-full"
                          >
                            {sendingContact ? "Enviando..." : "Enviar Consulta"}
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Completá el formulario para ver los resultados de tu simulación</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Nota informativa */}
        <Alert className="mt-8 bg-blue-900/20 border-blue-700">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Esta simulación es orientativa y no constituye una oferta de crédito. Los
            valores finales están sujetos a verificación crediticia y condiciones comerciales vigentes.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
