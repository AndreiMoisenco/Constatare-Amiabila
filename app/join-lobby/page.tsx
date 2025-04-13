"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { QrScanner } from "@/components/qr-scanner"
import { QrCode, AlertCircle } from "lucide-react"

export default function JoinLobby() {
  const [lobbyCode, setLobbyCode] = useState("")
  const [showScanner, setShowScanner] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check if code is provided in URL (from QR scan)
    const codeFromUrl = searchParams.get("code")
    if (codeFromUrl) {
      setLobbyCode(codeFromUrl)
      validateLobbyCode(codeFromUrl)
    }
  }, [searchParams])

  const validateLobbyCode = (code: string) => {
    // În mod normal, aici am face un API call pentru a verifica dacă lobby-ul există
    // Pentru demo, simulăm că lobby-ul există dacă codul are 6 caractere
    if (code.length === 6) {
      setError(null)
      return true
    } else {
      setError("Codul introdus nu este valid sau lobby-ul nu există")
      return false
    }
  }

  const handleJoinLobby = () => {
    if (lobbyCode.trim().length > 0) {
      if (validateLobbyCode(lobbyCode)) {
        // Salvăm codul în localStorage
        localStorage.setItem("lobbyCode", lobbyCode)
        localStorage.setItem("isLobbyCreator", "false")

        // Redirecționare către pagina de confirmare rol
        router.push(`/role-confirmation`)
      }
    }
  }

  const handleQrCodeScanned = (result: string) => {
    // Extract code from scanned URL
    try {
      const url = new URL(result)
      const code = url.searchParams.get("code")
      if (code) {
        setLobbyCode(code)
        validateLobbyCode(code)
        setShowScanner(false)
      }
    } catch (error) {
      console.error("Invalid QR code URL", error)
      setError("Codul QR scanat nu este valid")
    }
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <h1 className="page-title">Alătură-te Raportului</h1>
        <p className="page-subtitle">Introdu codul sau scanează codul QR</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {showScanner ? (
          <div className="flex flex-col gap-4">
            <QrScanner onScan={handleQrCodeScanned} />
            <button className="btn btn-secondary" onClick={() => setShowScanner(false)}>
              Introdu Codul Manual
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="mb-4">
              <label htmlFor="code" className="label">
                Cod Lobby
              </label>
              <input
                id="code"
                type="text"
                placeholder="Introdu codul de 6 caractere"
                value={lobbyCode}
                onChange={(e) => {
                  const newCode = e.target.value.toUpperCase()
                  setLobbyCode(newCode)
                  if (newCode.length === 6) {
                    validateLobbyCode(newCode)
                  }
                }}
                className="input text-center text-xl tracking-wider"
                maxLength={6}
              />
            </div>
            <button
              className="btn btn-secondary flex items-center justify-center gap-2"
              onClick={() => setShowScanner(true)}
            >
              <QrCode className="h-5 w-5" />
              <span>Scanează Codul QR</span>
            </button>
          </div>
        )}

        <button
          className="btn btn-primary mt-6"
          onClick={handleJoinLobby}
          disabled={lobbyCode.trim().length !== 6 || error !== null}
        >
          Alătură-te Raportului
        </button>
      </div>
    </div>
  )
}
