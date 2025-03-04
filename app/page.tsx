import { Suspense } from "react"
import GymTracker from "@/components/gym-tracker"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">Planificación</h1>
        <Suspense fallback={<LoadingSpinner />}>
          <GymTracker />
        </Suspense>
      </div>
    </main>
  )
}

