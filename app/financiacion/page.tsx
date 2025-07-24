import Image from "next/image"
import { Button } from "@/components/ui/button"

const plans = [
  { down: 3000000, installments: 24, amount: 120000 },
  { down: 2000000, installments: 36, amount: 100000 },
  { down: 1500000, installments: 48, amount: 85000 },
]

export default function FinanciacionPage() {
  return (
    <div className="min-h-screen bg-gray-900 pt-16">
      <section className="relative h-64 sm:h-80">
        <Image
          src="https://images.unsplash.com/photo-1549921296-3a6b71fd00c1?auto=format&fit=crop&w=1600&q=80"
          alt="Financiación"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
          <h1 className="text-4xl md:text-5xl font-bold">Financiación Personalizada</h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <p className="text-center text-gray-300 text-lg max-w-3xl mx-auto">
          Podés financiar tu próximo vehículo con diferentes planes adaptados a tus necesidades. Elegí la opción que mejor se ajuste a tu presupuesto.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div key={i} className="bg-gray-800 p-8 rounded-lg text-center hover-lift">
              <h3 className="text-xl font-semibold mb-4">Plan {i + 1}</h3>
              <p className="text-gray-300 mb-6">
                Anticipo ${plan.down.toLocaleString()} + {plan.installments} cuotas de ${plan.amount.toLocaleString()}
              </p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Elegir este plan</Button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-md hover:shadow-lg">
            <a href="/contacto">Simular mi crédito</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
