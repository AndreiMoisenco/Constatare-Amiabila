"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { User, Home, Shield } from "lucide-react"

export default function PersonalInfo() {
  // Simulăm date pre-completate de la o platformă externă
  const [email, setEmail] = useState("ion.popescu@email.ro")
  const [address, setAddress] = useState("Str. Victoriei nr. 25, Bloc B3, Ap. 45, București")
  const [hasCasco, setHasCasco] = useState(true)

  const router = useRouter()
  const searchParams = useSearchParams()
  const lobbyCode = searchParams.get("code") || ""

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Validare simplă
    if (!email || !address) {
      alert("Te rugăm să completezi toate câmpurile obligatorii")
      return
    }

    // Navigare către pagina de selectare vehicul
    router.push(`/vehicle-selection?code=${lobbyCode}`)
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <h1 className="page-title">Informații Personale</h1>
        <p className="page-subtitle">Verifică și confirmă datele tale</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label htmlFor="email" className="label flex items-center gap-2">
              <User className="h-4 w-4" />
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label htmlFor="address" className="label flex items-center gap-2">
              <Home className="h-4 w-4" />
              Adresa de domiciliu
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="textarea"
              rows={3}
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              id="casco"
              type="checkbox"
              checked={hasCasco}
              onChange={(e) => setHasCasco(e.target.checked)}
              className="w-5 h-5 accent-[var(--blue)]"
            />
            <label htmlFor="casco" className="flex items-center gap-2 cursor-pointer">
              <Shield className="h-4 w-4 text-[var(--blue)]" />
              <span>Am asigurare CASCO</span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary mt-4">
            Continuă
          </button>
        </form>
      </div>
    </div>
  )
}
