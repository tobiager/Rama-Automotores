import { getTasasFinanciacion, getAvailableCars } from "./supabase"

// Tasas fallback si no hay datos en la base
const TASAS_FALLBACK: Record<number, number> = {
  12: 35,
  18: 40,
  24: 45,
  36: 55,
  48: 62,
  60: 68,
}

export interface SimulacionFinanciacion {
  precio: number
  anticipo: number
  montoFinanciar: number
  plazo: number
  tasaAnual: number
  tasaMensual: number
  cuotaMensual: number
  totalPagar: number
  interesesTotales: number
  tea: number
}

export interface CarOption {
  id: number
  label: string
  price: number
}

// Obtener autos disponibles para financiación
export async function getCarsForFinancing(): Promise<CarOption[]> {
  try {
    const cars = await getAvailableCars()
    return cars.map((car) => ({
      id: car.id,
      label: `${car.brand} ${car.model} ${car.year} - ${formatCurrency(car.price)}`,
      price: car.price,
    }))
  } catch (error) {
    console.error("Error fetching cars for financing:", error)
    return []
  }
}

// Obtener tasa para un plazo específico
export async function getTasaForPlazo(plazo: number): Promise<number> {
  try {
    const tasas = await getTasasFinanciacion()

    // Buscar tasa en la base de datos
    const tasaEncontrada = tasas.find((t) => t.meses === plazo)
    if (tasaEncontrada) {
      return tasaEncontrada.tasa_anual
    }

    // Usar fallback si no se encuentra
    return TASAS_FALLBACK[plazo] || 50 // 50% por defecto si no existe el plazo
  } catch (error) {
    console.error("Error fetching tasa:", error)
    return TASAS_FALLBACK[plazo] || 50
  }
}

// Calcular financiación con sistema francés
export function calcularFinanciacion(
  precio: number,
  anticipo: number,
  plazo: number,
  tasaAnual: number,
): SimulacionFinanciacion {
  const montoFinanciar = Math.max(0, precio - anticipo)
  const tasaMensual = tasaAnual / 100 / 12

  let cuotaMensual: number

  // Prevenir división por cero
  if (tasaMensual === 0) {
    cuotaMensual = montoFinanciar / plazo
  } else {
    // Fórmula del sistema francés
    const factor = Math.pow(1 + tasaMensual, plazo)
    cuotaMensual = (montoFinanciar * (tasaMensual * factor)) / (factor - 1)
  }

  // Prevenir NaN
  if (isNaN(cuotaMensual) || !isFinite(cuotaMensual)) {
    cuotaMensual = 0
  }

  const totalPagar = cuotaMensual * plazo
  const interesesTotales = totalPagar - montoFinanciar

  // Calcular TEA (Tasa Efectiva Anual)
  const tea = Math.pow(1 + tasaMensual, 12) - 1

  return {
    precio,
    anticipo,
    montoFinanciar,
    plazo,
    tasaAnual,
    tasaMensual,
    cuotaMensual,
    totalPagar,
    interesesTotales,
    tea: tea * 100, // Convertir a porcentaje
  }
}

// Formatear moneda argentina
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Formatear porcentaje
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}

// Validar datos de entrada
export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateFinanciacionData(
  origenMonto: "auto" | "libre",
  selectedCarPrice: number,
  montoLibre: number,
  anticipo: number,
  plazo: number,
): ValidationResult {
  const errors: string[] = []

  const precio = origenMonto === "auto" ? selectedCarPrice : montoLibre

  if (origenMonto === "auto" && !selectedCarPrice) {
    errors.push("Debe seleccionar un auto")
  }

  if (origenMonto === "libre") {
    if (!montoLibre || montoLibre < 500000) {
      errors.push("El monto libre debe ser mayor a $500.000")
    }
  }

  if (anticipo < 0) {
    errors.push("El anticipo no puede ser negativo")
  }

  if (anticipo > precio) {
    errors.push("El anticipo no puede superar el precio del vehículo")
  }

  if (!plazo || ![12, 18, 24, 36, 48, 60].includes(plazo)) {
    errors.push("Debe seleccionar un plazo válido")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
