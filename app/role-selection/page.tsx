"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertTriangle, ShieldCheck } from "lucide-react"
import QRCode from "react-qr-code"
import { Copy } from "lucide-react"

export default function RoleSelection() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrValue, setQrValue] = useState("")
  const router = useRouter()

  // Obținem codul de lobby din localStorage
  const lobbyCode = typeof window !== "undefined" ? localStorage.getItem("lobbyCode") || "" : ""
  const isLobbyCreator = typeof window !== "undefined" ? localStorage.getItem("isLobbyCreator") === "true" : false

  const handleRoleSelection = (role: string) => {
    setSelectedRole(role)
  }

  const proceedToNextStep = () => {
    if (selectedRole) {
      // Salvăm rolul în localStorage
      localStorage.setItem("userRole", selectedRole)

      if (isLobbyCreator) {
        // Dacă este creatorul lobby-ului, arătăm codul QR
        const baseUrl = window.location.origin
        setQrValue(`${baseUrl}/join-lobby?code=${lobbyCode}`)
        setShowQRCode(true)
      } else {
        // Dacă nu este creatorul, continuăm cu fluxul normal
        navigateBasedOnRole(selectedRole)
      }
    }
  }

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(lobbyCode)
    alert("Cod copiat în clipboard")
  }

  const continueAfterQR = () => {
    if (selectedRole) {
      navigateBasedOnRole(selectedRole)
    }
  }

  const navigateBasedOnRole = (role: string) => {
    // Navigăm în funcție de rol
    router.push(`/vehicle-selection?role=${role}`)
  }

  // Dacă arătăm codul QR
  if (showQRCode) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="card">
          <h1 className="page-title">Lobby Creat</h1>
          <p className="page-subtitle">Împărtășește acest cod cu celălalt șofer</p>

          <div className="qr-container">
            <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-[var(--gray-200)]">
              <QRCode value={qrValue} size={200} />
            </div>

            <div className="relative">
              <div className="code-display">{lobbyCode}</div>
              <button onClick={copyCodeToClipboard} className="copy-button">
                <Copy className="h-5 w-5" />
              </button>
            </div>

            <p className="text-center text-gray text-sm">
              Cere celuilalt șofer să scaneze acest cod QR sau să introducă codul manual pentru a se alătura raportului
              tău.
            </p>
          </div>

          <button className="btn btn-primary mt-6" onClick={continueAfterQR}>
            Continuă la Pasul Următor
          </button>
        </div>
      </div>
    )
  }

  // Pagina de selectare a rolului
  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <h1 className="page-title">Selectează Rolul Tău</h1>
        <p className="page-subtitle">Care este rolul tău în acest accident?</p>

        <div className="flex flex-col gap-4 mb-6">
          <div
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
              selectedRole === "vinovat" ? "border-[var(--blue)] bg-[rgba(0,102,255,0.05)]" : "border-[var(--gray-300)]"
            }`}
            onClick={() => handleRoleSelection("vinovat")}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[rgba(234,88,12,0.1)] flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-[#ea580c]" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-1">Vinovat</h3>
                <p className="text-sm text-[var(--gray-600)]">
                  Sunt responsabil pentru accident sau am contribuit la producerea acestuia
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
              selectedRole === "victima" ? "border-[var(--blue)] bg-[rgba(0,102,255,0.05)]" : "border-[var(--gray-300)]"
            }`}
            onClick={() => handleRoleSelection("victima")}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[rgba(22,163,74,0.1)] flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-[#16a34a]" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-lg mb-1">Victimă</h3>
                <p className="text-sm text-[var(--gray-600)]">
                  Nu sunt responsabil pentru accident și am suferit pagube
                </p>
              </div>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={proceedToNextStep} disabled={!selectedRole}>
          Continuă
        </button>

        <p className="text-xs text-center text-[var(--gray-500)] mt-4">
          Rolul tău va fi vizibil pentru celălalt participant la accident
        </p>
      </div>
    </div>
  )
}
