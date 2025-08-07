import { getCarById } from "@/lib/supabase"
import { notFound } from "next/navigation"
import CarDetailClient from "@/components/CarDetailClient"

export default async function Page({ params }: { params: { id: string } }) {
  const id = parseInt(params.id)
  const car = await getCarById(id)

  if (!car) return notFound()

  return <CarDetailClient car={car} />
}
