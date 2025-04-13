"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowRight, Info, FileText, Clock, CheckCircle } from "lucide-react"

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const lobbyCode = searchParams.get("code") || ""

  // Informații pentru slide-urile de onboarding
  const slides = [
    {
      title: "Bine ai venit la Constatarea Amiabilă",
      description:
        "Această aplicație te va ghida prin procesul de completare a constatării amiabile în caz de accident.",
      icon: <Info className="h-12 w-12 text-[var(--blue)]" />,
    },
    {
      title: "Completare Simplă și Rapidă",
      description: "Procesul durează aproximativ 5-10 minute și va genera un document oficial valid.",
      icon: <Clock className="h-12 w-12 text-[var(--blue)]" />,
    },
    {
      title: "Document Digital",
      description: "La final vei primi un document PDF completat cu toate informațiile necesare.",
      icon: <FileText className="h-12 w-12 text-[var(--blue)]" />,
    },
    {
      title: "Gata să începi?",
      description: "Hai să stabilim rolul tău în acest accident și să completăm informațiile necesare.",
      icon: <CheckCircle className="h-12 w-12 text-[var(--blue)]" />,
    },
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      // Navigare către pagina de selectare a rolului
      router.push(`/role-selection?code=${lobbyCode}`)
    }
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <div className="absolute top-4 right-4 text-sm text-[var(--gray-500)]">
          <span className="font-medium">{currentSlide + 1}</span>/{slides.length}
        </div>

        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[var(--blue-light)] bg-opacity-20 flex items-center justify-center mb-4">
            {slides[currentSlide].icon}
          </div>
          <h1 className="page-title">{slides[currentSlide].title}</h1>
          <p className="page-subtitle">{slides[currentSlide].description}</p>
        </div>

        {/* Indicator de progres */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${index === currentSlide ? "bg-[var(--blue)]" : "bg-[var(--gray-300)]"}`}
            />
          ))}
        </div>

        <button className="btn btn-primary flex items-center justify-center gap-2" onClick={nextSlide}>
          <span>{currentSlide < slides.length - 1 ? "Continuă" : "Începe Completarea"}</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
