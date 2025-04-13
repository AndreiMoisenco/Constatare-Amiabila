"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Car, Plus, QrCode } from "lucide-react"
import { Html5Qrcode } from "html5-qrcode"

// Date simulate pentru vehiculele înregistrate
const registeredVehicles = [
  { id: 1, name: "Dacia Logan", plate: "B 123 ABC", year: 2018 },
  { id: 2, name: "Volkswagen Golf", plate: "B 456 DEF", year: 2020 },
  { id: 3, name: "Renault Clio", plate: "B 789 GHI", year: 2019 },
]

export default function VehicleSelection() {
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null)
  const [isOtherVehicle, setIsOtherVehicle] = useState(false)
  const [vinCode, setVinCode] = useState("")
  const [showScanner, setShowScanner] = useState(false)
  const [scannerActive, setScannerActive] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const router = useRouter()

  // Obținem rolul și codul de lobby din localStorage
  const [userRole, setUserRole] = useState<string>("")
  const [lobbyCode, setLobbyCode] = useState<string>("")

  useEffect(() => {
    // Obținem datele din localStorage când componenta se montează
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("userRole") || "")
      setLobbyCode(localStorage.getItem("lobbyCode") || "")
    }
  }, [])

  const handleVehicleSelect = (vehicleId: number) => {
    setSelectedVehicle(vehicleId)
    setIsOtherVehicle(false)
  }

  const handleOtherVehicle = () => {
    setSelectedVehicle(null)
    setIsOtherVehicle(true)
  }

  const startVinScanner = () => {
    setShowScanner(true)

    setTimeout(() => {
      const scanner = new Html5Qrcode("vin-scanner")
      scannerRef.current = scanner

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 100 } },
          (decodedText) => {
            // Presupunem că textul scanat este un cod VIN
            setVinCode(decodedText.toUpperCase())
            stopVinScanner()
          },
          (errorMessage) => {
            console.log(errorMessage)
          },
        )
        .then(() => {
          setScannerActive(true)
        })
        .catch((err) => {
          console.error("Failed to start scanner", err)
        })
    }, 100)
  }

  const stopVinScanner = () => {
    if (scannerRef.current && scannerActive) {
      scannerRef.current.stop().catch(console.error)
      setScannerActive(false)
      setShowScanner(false)
    }
  }

  const handleSubmit = () => {
    // Validare
    if (!selectedVehicle && (!isOtherVehicle || !vinCode)) {
      alert("Te rugăm să selectezi un vehicul sau să introduci codul VIN")
      return
    }

    // Navigare către pagina următoare în funcție de rol
    if (userRole === "victima") {
      router.push(`/payment-details`)
    } else {
      router.push(`/questionnaire?step=1`)
    }
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <h1 className="page-title">Selectează Vehiculul</h1>
        <p className="page-subtitle">Care vehicul a fost implicat în accident?</p>

        <div className="flex flex-col gap-4 mb-6">
          {registeredVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                selectedVehicle === vehicle.id
                  ? "border-[var(--blue)] bg-[rgba(0,102,255,0.05)]"
                  : "border-[var(--gray-300)]"
              }`}
              onClick={() => handleVehicleSelect(vehicle.id)}
            >
              <div className="flex items-center gap-3">
                <Car className="h-6 w-6 text-[var(--gray-600)]" />
                <div>
                  <p className="font-medium">{vehicle.name}</p>
                  <p className="text-sm text-[var(--gray-600)]">
                    {vehicle.plate} • {vehicle.year}
                  </p>
                </div>
              </div>
            </div>
          ))}

          <div
            className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
              isOtherVehicle ? "border-[var(--blue)] bg-[rgba(0,102,255,0.05)]" : "border-[var(--gray-300)]"
            }`}
            onClick={handleOtherVehicle}
          >
            <div className="flex items-center gap-3">
              <Plus className="h-6 w-6 text-[var(--gray-600)]" />
              <div>
                <p className="font-medium">Alt vehicul</p>
                <p className="text-sm text-[var(--gray-600)]">Vehicul neînregistrat pe numele meu</p>
              </div>
            </div>
          </div>
        </div>

        {isOtherVehicle && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="vin" className="label">
                Cod VIN vehicul
              </label>
              <button
                onClick={startVinScanner}
                className="flex items-center gap-1 text-sm text-[var(--blue)] font-medium"
              >
                <QrCode className="h-4 w-4" />
                <span>Scanează</span>
              </button>
            </div>

            <input
              id="vin"
              type="text"
              value={vinCode}
              onChange={(e) => setVinCode(e.target.value.toUpperCase())}
              placeholder="ex: WVWZZZ1JZXW000010"
              className="input"
              maxLength={17}
            />
            <p className="text-xs text-[var(--gray-600)] mt-2">
              Codul VIN are 17 caractere și se găsește pe certificatul de înmatriculare sau în parbriz
            </p>

            {showScanner && (
              <div className="mt-4">
                <div
                  id="vin-scanner"
                  className="w-full h-[200px] border-2 border-[var(--gray-300)] rounded-lg overflow-hidden"
                ></div>
                <div className="flex justify-center mt-2">
                  <button onClick={stopVinScanner} className="text-sm text-[var(--blue)] font-medium">
                    Anulează scanarea
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!selectedVehicle && (!isOtherVehicle || !vinCode)}
        >
          Continuă
        </button>
      </div>
    </div>
  )
}
