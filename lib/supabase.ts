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
  mileage?: number | null
  fuel?: string | null
  transmission?: string | null
  color?: string | null
  features?: string[] | null
  created_at?: string
  updated_at?: string
  deleted?: boolean // Añadimos la propiedad 'deleted'
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

export interface AdminUser {
  id: number
  name: string
  username: string
  password: string
  email?: string
  active: boolean
  created_at?: string
  updated_at?: string
}

// Funciones para usuarios admin
export async function authenticateUser(username: string, password: string): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("username", username)
    .eq("password", password)
    .eq("active", true)
    .single()

  if (error) {
    console.error("Error authenticating user:", error)
    return null
  }

  return data
}

export async function getAllAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase.from("admin_users").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching admin users:", error)
    return []
  }

  return data || []
}

export async function createAdminUser(
  user: Omit<AdminUser, "id" | "created_at" | "updated_at">,
): Promise<AdminUser | null> {
  const { data, error } = await supabase.from("admin_users").insert([user]).select().single()

  if (error) {
    console.error("Error creating admin user:", error)
    return null
  }

  return data
}

export async function updateAdminUser(id: number, updates: Partial<AdminUser>): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from("admin_users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating admin user:", error)
    return null
  }

  return data
}

// Funciones para autos
export async function getAllCars(): Promise<Car[]> {
  // Para el admin, obtenemos todos los autos, incluyendo los eliminados suavemente
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
    .eq("deleted", false) // Solo autos no vendidos y no eliminados
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
    .eq("deleted", false) // Solo autos vendidos y no eliminados
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching sold cars:", error)
    return []
  }

  return data || []
}

export async function getDeletedCars(): Promise<Car[]> {
  const { data, error } = await supabase
    .from("cars")
    .select("*")
    .eq("deleted", true) // Solo autos eliminados suavemente
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Error fetching deleted cars:", error)
    return []
  }

  return data || []
}

export async function createCar(car: Omit<Car, "id" | "created_at" | "updated_at">): Promise<Car | null> {
  const { data, error } = await supabase
    .from("cars")
    .insert([{ ...car, deleted: false }])
    .select()
    .single() // Asegurar que no está eliminado al crear

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
    return null
  }

  return data
}

// Modificamos deleteCar para que sea un "soft delete"
export async function deleteCar(id: number): Promise<boolean> {
  const { error } = await supabase
    .from("cars")
    .update({ deleted: true, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    console.error("Error soft-deleting car:", error)
    return false
  }

  return true
}

// Nueva función para restaurar un auto
export async function restoreCar(id: number): Promise<Car | null> {
  const { data, error } = await supabase
    .from("cars")
    .update({ deleted: false, sold: false, updated_at: new Date().toISOString() }) // Al restaurar, también lo marcamos como no vendido
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error restoring car:", error)
    return null
  }

  return data
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
