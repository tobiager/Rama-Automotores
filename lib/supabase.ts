import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Car {
  id: number
  brand: string
  model: string
  year: number
  price: number
  image: string | null
  images?: string[] | null
  description: string
  sold: boolean
  deleted?: boolean
  mileage?: number | null
  fuel?: string | null
  transmission?: string | null
  color?: string | null
  features?: string[] | null
  created_at?: string
  updated_at?: string
}

export interface Contact {
  id?: number
  name: string
  email: string
  phone?: string
  subject?: string
  message: string
  created_at?: string
}

export interface TasaFinanciacion {
  meses: number
  tasa_anual: number
}

// Funciones para autos
export async function getAllCars(): Promise<Car[]> {
  const { data, error } = await supabase.from("cars").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching cars:", error)
    return []
  }

  return data || []
}

export async function getCarById(id: number): Promise<Car | null> {
  const { data, error } = await supabase.from("cars").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching car:", error)
    return null
  }

  return data
}

export async function getAvailableCars(): Promise<Car[]> {
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("sold", false)
    .eq("deleted", false)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching available cars:", error)
    return []
  }

  return data || []
}

export async function getSoldCars(): Promise<Car[]> {
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("sold", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching sold cars:", error)
    return []
  }

  return data || []
}

export async function createCar(car: Omit<Car, "id" | "created_at" | "updated_at">): Promise<Car | null> {
  const { data, error } = await supabase.from("cars").insert([car]).select().single()

  if (error) {
    console.error("Error creating car:", error)
    return null
  }

  return data
}

export async function updateCar(id: number, updates: Partial<Car>): Promise<Car | null> {
  const { data, error } = await supabase
    .from("cars")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating car:", error)
    return false
  }

  return data
}

export async function deleteCar(id: number): Promise<boolean> {
  const { error } = await supabase.from("cars").delete().eq("id", id)

  if (error) {
    console.error("Error deleting car:", error)
    return false
  }

  return true
}

// Funciones para contactos
export async function createContact(contact: Omit<Contact, "id" | "created_at">): Promise<Contact | null> {
  const { data, error } = await supabase.from("contacts").insert([contact]).select().single()

  if (error) {
    console.error("Error creating contact:", error)
    return null
  }

  return data
}

export async function getAllContacts(): Promise<Contact[]> {
  const { data, error } = await supabase.from("contacts").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching contacts:", error)
    return []
  }

  return data || []
}

// Funciones para tasas de financiación
export async function getTasasFinanciacion(): Promise<TasaFinanciacion[]> {
  try {
    const { data, error } = await supabase
      .from("tasas_financiacion")
      .select("meses, tasa_anual")
      .order("meses", { ascending: true })

    if (error) {
      console.warn("Error fetching tasas_financiacion, using fallback:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.warn("Table tasas_financiacion might not exist, using fallback:", error)
    return []
  }
}
