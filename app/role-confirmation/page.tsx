"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ShieldCheck, Check, X } from "lucide-react"

export default function RoleConfirmation() {
  const [loading, setLoading] = useState(true)
  const [assignedRole, setAssignedRole] = useState<string | null>(null)
  const router = useRouter()

  // Obținem codul de lobby din localStorage
  const lobbyCode = typeof window !== "undefined" ? localStorage.getItem("lobbyCode") || "" : ""

  useEffect(() => {
    // În mod normal, aici am face un API call pentru a obține rolul asignat
    // Pentru demo, simulăm că rolul este opus celui selectat de primul utilizator
    const simulateRoleAssignment = () => {
      // Simulăm un delay pentru a arăta loading state
      setTimeout(() => {
        // Presupunem că primul utilizator a selectat "vinovat", deci al doilea va fi "victima"
        // Într-o implementare reală, acest rol ar veni de la server
        const creatorRole = "vinovat" // În mod normal, acest rol ar veni de la server
        const assignedRole = creatorRole === "vinovat" ? "victima" : "vinovat"
        setAssignedRole(assignedRole)
        setLoading(false)
      }, 1500)
    }

    simulateRoleAssignment()
  }, [])

  const handleAccept = () => {
    // Salvăm rolul în localStorage
    if (assignedRole) {
      localStorage.setItem("userRole", assignedRole)
    }
    router.push(`/vehicle-selection?role=${assignedRole}`)
  }

  const handleReject = () => {
    // Redirecționare către pagina principală sau de dispute
    router.push("/")
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="card">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 border-4 border-t-[var(--blue)] border-r-[var(--gray-200)] border-b-[var(--gray-200)] border-l-[var(--gray-200)] rounded-full animate-spin mb-4"></div>
            <p className="text-[var(--gray-600)]">Se încarcă informațiile despre accident...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <h1 className="page-title">Confirmare Rol</h1>
        <p className="page-subtitle">Celălalt participant v-a atribuit următorul rol:</p>

        <div className="p-6 border-2 rounded-xl border-[var(--gray-300)] mb-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full ${
                assignedRole === "vinovat" ? "bg-[rgba(234,88,12,0.1)]" : "bg-[rgba(22,163,74,0.1)]"
              } flex items-center justify-center`}
            >
              {assignedRole === "vinovat" ? (
                <AlertTriangle className="h-6 w-6 text-[#ea580c]" />
              ) : (
                <ShieldCheck className="h-6 w-6 text-[#16a34a]" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-lg mb-1">{assignedRole === "vinovat" ? "Vinovat" : "Victimă"}</h3>
              <p className="text-sm text-[var(--gray-600)]">
                {assignedRole === "vinovat"
                  ? "Sunteți considerat responsabil pentru accident"
                  : "Sunteți considerat victimă în acest accident"}
              </p>
            </div>
          </div>
        </div>

        <p className="text-center mb-6">
          Sunteți de acord cu acest rol? Dacă nu sunteți de acord, puteți refuza și încheia procesul.
        </p>

        <div className="flex gap-4">
          <button className="btn btn-secondary flex-1 flex items-center justify-center gap-2" onClick={handleReject}>
            <X className="h-5 w-5" />
            <span>Refuz</span>
          </button>
          <button className="btn btn-primary flex-1 flex items-center justify-center gap-2" onClick={handleAccept}>
            <Check className="h-5 w-5" />
            <span>Accept</span>
          </button>
        </div>
      </div>
    </div>
  )
}
