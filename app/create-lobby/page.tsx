"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateLobby() {
  const router = useRouter()

  // Redirecționăm direct către pagina de selectare a rolului
  // Acest component devine doar un intermediar
  useState(() => {
    // Generăm un cod de lobby și îl stocăm în localStorage
    const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    localStorage.setItem("lobbyCode", generatedCode)
    localStorage.setItem("isLobbyCreator", "true")

    // Redirecționăm către pagina de selectare a rolului
    router.push(`/role-selection`)
  })

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 border-4 border-t-[var(--blue)] border-r-[var(--gray-200)] border-b-[var(--gray-200)] border-l-[var(--gray-200)] rounded-full animate-spin mb-4"></div>
          <p className="text-[var(--gray-600)]">Se creează un nou raport de accident...</p>
        </div>
      </div>
    </div>
  )
}
