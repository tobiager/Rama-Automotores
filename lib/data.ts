export interface Car {
  id: number
  brand: string
  model: string
  year: number
  price: number
  image: string
  images?: string[]
  description: string
  sold: boolean
  mileage?: number
  fuel?: string
  transmission?: string
  color?: string
  features?: string[]
}

export const cars: Car[] = [
  {
    id: 1,
    brand: "BMW",
    model: "X5",
    year: 2022,
    price: 85000,
    image: "/placeholder.svg?height=400&width=600",
    images: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600",
    ],
    description: "SUV premium con tecnología avanzada y sistema de tracción integral xDrive",
    sold: false,
    mileage: 15000,
    fuel: "Gasolina",
    transmission: "Automática",
    color: "Negro Metálico",
    features: ["Navegación GPS", "Asientos de cuero", "Techo panorámico", "Sistema de sonido premium"],
  },
  {
    id: 2,
    brand: "Mercedes-Benz",
    model: "C-Class",
    year: 2023,
    price: 65000,
    image: "/placeholder.svg?height=400&width=600",
    images: ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=400&width=600"],
    description: "Sedán ejecutivo de lujo con interior de cuero premium y tecnología MBUX",
    sold: false,
    mileage: 8000,
    fuel: "Gasolina",
    transmission: "Automática",
    color: "Blanco Polar",
    features: ["MBUX", "Asientos ventilados", "Cámara 360°", "Piloto automático"],
  },
  {
    id: 3,
    brand: "Audi",
    model: "A4",
    year: 2021,
    price: 55000,
    image: "/placeholder.svg?height=400&width=600",
    description: "Elegancia y performance en un diseño sofisticado con tecnología quattro",
    sold: false,
    mileage: 25000,
    fuel: "Gasolina",
    transmission: "Automática",
    color: "Plata Metálico",
    features: ["Quattro AWD", "Virtual Cockpit", "Bang & Olufsen", "Asientos deportivos"],
  },
  {
    id: 4,
    brand: "Porsche",
    model: "911",
    year: 2023,
    price: 150000,
    image: "/placeholder.svg?height=400&width=600",
    description: "Deportivo icónico con motor boxer y tracción trasera, pura emoción al volante",
    sold: false,
    mileage: 5000,
    fuel: "Gasolina",
    transmission: "Manual",
    color: "Rojo Carrera",
    features: ["Motor Boxer", "Suspensión deportiva", "Frenos Brembo", "Interior Alcantara"],
  },
  {
    id: 5,
    brand: "Tesla",
    model: "Model S",
    year: 2022,
    price: 95000,
    image: "/placeholder.svg?height=400&width=600",
    description: "Sedán eléctrico de lujo con autopilot avanzado y autonomía extendida",
    sold: false,
    mileage: 12000,
    fuel: "Eléctrico",
    transmission: "Automática",
    color: "Azul Metálico",
    features: ["Autopilot", "Supercargador", "Pantalla táctil 17''", "Actualizaciones OTA"],
  },
  {
    id: 6,
    brand: "Range Rover",
    model: "Evoque",
    year: 2021,
    price: 70000,
    image: "/placeholder.svg?height=400&width=600",
    description: "SUV compacto de lujo con diseño distintivo y capacidades off-road",
    sold: false,
    mileage: 18000,
    fuel: "Gasolina",
    transmission: "Automática",
    color: "Gris Oscuro",
    features: ["Terrain Response", "Techo convertible", "Meridian Audio", "Cámara trasera"],
  },
]

export const soldCars: Car[] = [
  {
    id: 101,
    brand: "BMW",
    model: "X3",
    year: 2020,
    price: 65000,
    image: "/placeholder.svg?height=400&width=600",
    description: "SUV premium con excelente mantenimiento, vendido a cliente satisfecho",
    sold: true,
    mileage: 35000,
    fuel: "Gasolina",
    transmission: "Automática",
    color: "Blanco Alpine",
  },
  {
    id: 102,
    brand: "Mercedes-Benz",
    model: "E-Class",
    year: 2019,
    price: 75000,
    image: "/placeholder.svg?height=400&width=600",
    description: "Sedán ejecutivo de lujo, único dueño, historial completo de mantenimiento",
    sold: true,
    mileage: 42000,
    fuel: "Gasolina",
    transmission: "Automática",
    color: "Negro Obsidiana",
  },
  {
    id: 103,
    brand: "Audi",
    model: "Q5",
    year: 2021,
    price: 70000,
    image: "/placeholder.svg?height=400&width=600",
    description: "SUV familiar con tecnología quattro, perfecto estado",
    sold: true,
    mileage: 28000,
    fuel: "Gasolina",
    transmission: "Automática",
    color: "Gris Daytona",
  },
]

export function getAllCars(): Car[] {
  return cars
}

export function getCarById(id: number): Car | undefined {
  return cars.find((car) => car.id === id)
}

export function getSoldCars(): Car[] {
  return soldCars
}

export function getAvailableCars(): Car[] {
  return cars.filter((car) => !car.sold)
}

export function getCarsByBrand(brand: string): Car[] {
  return cars.filter((car) => car.brand.toLowerCase().includes(brand.toLowerCase()))
}

export function getCarsByPriceRange(min: number, max: number): Car[] {
  return cars.filter((car) => car.price >= min && car.price <= max)
}
