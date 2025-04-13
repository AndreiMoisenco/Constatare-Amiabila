"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function FaultSelection() {
  const [selectedFault, setSelectedFault] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const lobbyCode = searchParams.get("code") || ""

  const handleFaultSelection = (value: string) => {
    setSelectedFault(value)
  }

  const proceedToNextStep = () => {
    router.push(`/damage-selection?code=${lobbyCode}&fault=${selectedFault}`)
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <h1 className="page-title">Determinarea Vinovăției</h1>
        <p className="page-subtitle">Cine crezi că este vinovat pentru accident?</p>

        <div className="radio-group">
          <label
            className={`radio-option ${selectedFault === "self" ? "selected" : ""}`}
            onClick={() => handleFaultSelection("self")}
          >
            <input type="radio" name="fault" value="self" checked={selectedFault === "self"} onChange={() => {}} />
            <span>Eu sunt vinovat</span>
          </label>

          <label
            className={`radio-option ${selectedFault === "other" ? "selected" : ""}`}
            onClick={() => handleFaultSelection("other")}
          >
            <input type="radio" name="fault" value="other" checked={selectedFault === "other"} onChange={() => {}} />
            <span>Celălalt șofer este vinovat</span>
          </label>
        </div>

        <button className="btn btn-primary" onClick={proceedToNextStep} disabled={!selectedFault}>
          Continuă
        </button>
      </div>
    </div>
  )
}
