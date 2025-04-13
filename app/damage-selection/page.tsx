"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DamageSelection() {
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    // Verificăm dacă utilizatorul are rolul de victimă
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole") || ""
      setUserRole(role)

      // Dacă nu este victimă, redirecționăm
      if (role !== "victima") {
        router.push("/")
      }
    }
  }, [router])

  const handleAreaClick = (area: string) => {
    setSelectedArea(area)
  }

  const proceedToNextStep = () => {
    // Salvăm zona selectată în localStorage
    if (selectedArea) {
      localStorage.setItem("damageArea", selectedArea)
    }

    // Navigăm la chestionar
    router.push(`/questionnaire?step=1`)
  }

  // Car damage areas
  const areas = [
    { id: "front", label: "Față", coords: "120,60,180,60,180,100,120,100" },
    { id: "rear", label: "Spate", coords: "120,200,180,200,180,240,120,240" },
    { id: "left", label: "Partea Stângă", coords: "100,100,120,100,120,200,100,200" },
    { id: "right", label: "Partea Dreaptă", coords: "180,100,200,100,200,200,180,200" },
    { id: "front-left", label: "Față Stânga", coords: "100,60,120,60,120,100,100,100" },
    { id: "front-right", label: "Față Dreapta", coords: "180,60,200,60,200,100,180,100" },
    { id: "rear-left", label: "Spate Stânga", coords: "100,200,120,200,120,240,100,240" },
    { id: "rear-right", label: "Spate Dreapta", coords: "180,200,200,200,200,240,180,240" },
  ]

  // Dacă utilizatorul nu are rolul de victimă, nu afișăm nimic (redirecționarea se face în useEffect)
  if (userRole !== "victima" && userRole !== "") {
    return null
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <h1 className="page-title">Locația Avariei</h1>
        <p className="page-subtitle">Selectează unde a fost avariat vehiculul</p>

        <div className="car-damage-selector">
          <svg width="100%" height="100%" viewBox="0 0 300 300">
            {/* Car body outline */}
            <rect x="100" y="60" width="100" height="180" stroke="#000" strokeWidth="2" fill="none" />

            {/* Wheels */}
            <circle cx="120" cy="90" r="10" fill="#333" />
            <circle cx="180" cy="90" r="10" fill="#333" />
            <circle cx="120" cy="210" r="10" fill="#333" />
            <circle cx="180" cy="210" r="10" fill="#333" />

            {/* Clickable areas */}
            {areas.map((area) => (
              <polygon
                key={area.id}
                points={area.coords}
                className={`car-damage-area ${selectedArea === area.id ? "selected" : ""}`}
                onClick={() => handleAreaClick(area.id)}
              />
            ))}
          </svg>

          {/* Instructions */}
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <p className="text-sm text-gray">Apasă pe zona avariată</p>
          </div>
        </div>

        {selectedArea && (
          <div className="text-center mb-4">
            <p className="font-medium">Selectat: {areas.find((a) => a.id === selectedArea)?.label}</p>
          </div>
        )}

        <button className="btn btn-primary" onClick={proceedToNextStep} disabled={!selectedArea}>
          Continuă la Chestionar
        </button>
      </div>
    </div>
  )
}
