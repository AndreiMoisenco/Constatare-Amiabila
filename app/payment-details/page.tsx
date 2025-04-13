"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Calendar, Lock, CheckCircle, Camera, ChevronRight, Clock, User } from "lucide-react"

// Carduri salvate simulate
const savedCards = [
  { id: 1, type: "visa", last4: "4242", expiryDate: "12/25", cardHolder: "ION POPESCU" },
  { id: 2, type: "mastercard", last4: "8765", expiryDate: "09/24", cardHolder: "ION POPESCU" },
]

export default function PaymentDetails() {
  const [cardNumber, setCardNumber] = useState("")
  const [cardHolder, setCardHolder] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [iban, setIban] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"card" | "iban" | "saved">("card")
  const [userRole, setUserRole] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showCardScanner, setShowCardScanner] = useState(false)
  const [selectedSavedCard, setSelectedSavedCard] = useState<number | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [scanningCard, setScanningCard] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  // Curățare la demontarea componentei
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const formatCardNumber = (value: string) => {
    // Eliminăm toate caracterele non-numerice
    const numbers = value.replace(/\D/g, "")

    // Grupăm numerele în seturi de câte 4
    const groups = []
    for (let i = 0; i < numbers.length; i += 4) {
      groups.push(numbers.slice(i, i + 4))
    }

    // Limităm la 16 cifre (4 grupuri)
    return groups.slice(0, 4).join(" ")
  }

  const formatExpiryDate = (value: string) => {
    // Eliminăm toate caracterele non-numerice
    const numbers = value.replace(/\D/g, "")

    // Format MM/YY
    if (numbers.length > 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`
    }
    return numbers
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value))
  }

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpiryDate(formatExpiryDate(e.target.value))
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limităm CVV la 3 sau 4 cifre
    const value = e.target.value.replace(/\D/g, "").slice(0, 4)
    setCvv(value)
  }

  const handleIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Convertim la majuscule și eliminăm spațiile
    const value = e.target.value.toUpperCase().replace(/\s/g, "")
    setIban(value)
  }

  const startCardScanner = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })

      setStream(mediaStream)
      setShowCardScanner(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Eroare la accesarea camerei:", error)
      alert("Nu s-a putut accesa camera. Te rugăm să verifici permisiunile.")
    }
  }

  const stopCardScanner = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setShowCardScanner(false)
  }

  const scanCard = () => {
    setScanningCard(true)

    // Simulăm procesul de scanare a cardului
    setTimeout(() => {
      // În mod normal, aici ar fi logica de recunoaștere a textului din imagine
      // Pentru demo, vom simula că am detectat un card
      setCardNumber("4111 1111 1111 1111")
      setCardHolder("ION POPESCU")
      setExpiryDate("12/25")

      stopCardScanner()
      setScanningCard(false)
    }, 3000)
  }

  const selectSavedCard = (cardId: number) => {
    setSelectedSavedCard(cardId)
    setPaymentMethod("saved")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulăm procesarea datelor
    setTimeout(() => {
      // Salvăm datele în localStorage (în practică ar trebui trimise la server)
      if (paymentMethod === "card") {
        localStorage.setItem("paymentMethod", "card")
        localStorage.setItem("cardNumberLast4", cardNumber.slice(-4))
      } else if (paymentMethod === "saved") {
        const selectedCard = savedCards.find((card) => card.id === selectedSavedCard)
        if (selectedCard) {
          localStorage.setItem("paymentMethod", "card")
          localStorage.setItem("cardNumberLast4", selectedCard.last4)
        }
      } else {
        localStorage.setItem("paymentMethod", "iban")
        localStorage.setItem("ibanLast4", iban.slice(-4))
      }

      setIsSuccess(true)

      // Redirecționăm după un scurt delay
      setTimeout(() => {
        router.push("/photo-capture")
      }, 1500)
    }, 2000)
  }

  // Dacă utilizatorul nu are rolul de victimă, nu afișăm nimic
  if (userRole !== "victima" && userRole !== "") {
    return null
  }

  // Afișăm ecranul de succes
  if (isSuccess) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="card">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="page-title">Detalii Salvate</h1>
            <p className="text-center text-[var(--gray-600)] mb-4">Datele tale de plată au fost salvate cu succes.</p>
            <p className="text-center text-[var(--gray-600)]">Vei fi redirecționat automat...</p>
          </div>
        </div>
      </div>
    )
  }

  // Afișăm scanner-ul de carduri
  if (showCardScanner) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="card">
          <h1 className="page-title">Scanare Card</h1>
          <p className="page-subtitle">Poziționează cardul în cadru pentru scanare</p>

          <div className="relative w-full h-64 bg-black rounded-xl overflow-hidden mb-6">
            <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />

            {/* Overlay pentru ghidaj */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[85%] h-[55%] border-2 border-white border-dashed rounded-lg"></div>
            </div>

            {scanningCard && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-white">Se scanează cardul...</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button className="btn btn-secondary flex-1" onClick={stopCardScanner}>
              Anulează
            </button>
            <button className="btn btn-primary flex-1" onClick={scanCard} disabled={scanningCard}>
              {scanningCard ? "Se scanează..." : "Scanează Card"}
            </button>
          </div>

          <p className="text-xs text-center text-[var(--gray-500)] mt-4">
            Asigură-te că numărul cardului și data expirării sunt vizibile
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <h1 className="page-title">Detalii de Plată</h1>
        <p className="page-subtitle">Adaugă detaliile pentru primirea compensației</p>

        {/* Carduri salvate */}
        {savedCards.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium mb-2">Carduri salvate</h3>
            <div className="flex flex-col gap-3">
              {savedCards.map((card) => (
                <div
                  key={card.id}
                  className={`p-3 border-2 rounded-lg cursor-pointer flex items-center ${
                    selectedSavedCard === card.id && paymentMethod === "saved"
                      ? "border-[var(--blue)] bg-[rgba(0,102,255,0.05)]"
                      : "border-[var(--gray-300)]"
                  }`}
                  onClick={() => selectSavedCard(card.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {card.type === "visa" ? (
                        <svg className="h-6 w-8" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="32" height="24" rx="4" fill="#F9F9F9" />
                          <path
                            d="M12.223 15.698H10.037L8.977 10.517C8.932 10.329 8.833 10.16 8.687 10.047C8.16 9.698 7.578 9.423 6.941 9.258V9.032H10.312C10.697 9.032 10.997 9.313 11.052 9.698L11.608 13.457L13.338 9.032H15.469L12.223 15.698ZM16.305 15.698H14.229L15.744 9.032H17.82L16.305 15.698ZM20.161 11.128C20.216 10.743 20.516 10.517 20.901 10.517C21.506 10.462 22.166 10.572 22.716 10.853L23.051 9.148C22.501 8.923 21.891 8.813 21.341 8.813C19.32 8.813 17.855 9.863 17.855 11.403C17.855 12.618 18.905 13.237 19.655 13.622C20.461 14.007 20.736 14.282 20.681 14.667C20.681 15.217 20.076 15.492 19.486 15.492C18.826 15.492 18.166 15.327 17.561 15.052L17.226 16.757C17.886 17.032 18.601 17.142 19.265 17.142C21.451 17.197 22.881 16.147 22.881 14.502C22.881 12.343 20.161 12.233 20.161 11.128Z"
                            fill="#172B85"
                          />
                        </svg>
                      ) : (
                        <svg className="h-6 w-8" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <rect width="32" height="24" rx="4" fill="#F9F9F9" />
                          <path d="M12 18H20V16H12V18Z" fill="#FF5F00" />
                          <path
                            d="M12.5 12C12.5 9.7 13.62 7.68 15.36 6.44C14.2 5.52 12.76 5 11.2 5C7.24 5 4 8.14 4 12C4 15.86 7.24 19 11.2 19C12.76 19 14.2 18.48 15.36 17.56C13.62 16.32 12.5 14.3 12.5 12Z"
                            fill="#EB001B"
                          />
                          <path
                            d="M28 12C28 15.86 24.76 19 20.8 19C19.24 19 17.8 18.48 16.64 17.56C18.38 16.32 19.5 14.3 19.5 12C19.5 9.7 18.38 7.68 16.64 6.44C17.8 5.52 19.24 5 20.8 5C24.76 5 28 8.14 28 12Z"
                            fill="#F79E1B"
                          />
                        </svg>
                      )}
                      <span className="font-medium">•••• {card.last4}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-[var(--gray-600)]">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{card.expiryDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{card.cardHolder}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[var(--gray-400)]" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4 mb-6">
          <button
            className={`flex-1 py-3 px-4 rounded-lg border-2 ${
              paymentMethod === "card" ? "border-[var(--blue)] bg-[rgba(0,102,255,0.05)]" : "border-[var(--gray-300)]"
            }`}
            onClick={() => {
              setPaymentMethod("card")
              setSelectedSavedCard(null)
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span>Card Nou</span>
            </div>
          </button>

          <button
            className={`flex-1 py-3 px-4 rounded-lg border-2 ${
              paymentMethod === "iban" ? "border-[var(--blue)] bg-[rgba(0,102,255,0.05)]" : "border-[var(--gray-300)]"
            }`}
            onClick={() => {
              setPaymentMethod("iban")
              setSelectedSavedCard(null)
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2 10H22V17C22 18.6569 20.6569 20 19 20H5C3.34315 20 2 18.6569 2 17V10Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M22 10V7C22 5.34315 20.6569 4 19 4H5C3.34315 4 2 5.34315 2 7V10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 14.5C12 13.6716 12.6716 13 13.5 13H18.5C19.3284 13 20 13.6716 20 14.5C20 15.3284 19.3284 16 18.5 16H13.5C12.6716 16 12 15.3284 12 14.5Z"
                  fill="currentColor"
                />
              </svg>
              <span>IBAN</span>
            </div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {paymentMethod === "card" && (
            <>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="cardNumber" className="label flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Număr Card
                  </label>
                  <button
                    type="button"
                    onClick={startCardScanner}
                    className="flex items-center gap-1 text-sm text-[var(--blue)] font-medium"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Scanează</span>
                  </button>
                </div>
                <input
                  id="cardNumber"
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  className="input"
                  maxLength={19}
                  required={paymentMethod === "card"}
                />
              </div>

              <div>
                <label htmlFor="cardHolder" className="label">
                  Titular Card
                </label>
                <input
                  id="cardHolder"
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="NUME PRENUME"
                  className="input"
                  required={paymentMethod === "card"}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label htmlFor="expiryDate" className="label flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Data Expirării
                  </label>
                  <input
                    id="expiryDate"
                    type="text"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    placeholder="MM/YY"
                    className="input"
                    maxLength={5}
                    required={paymentMethod === "card"}
                  />
                </div>

                <div className="flex-1">
                  <label htmlFor="cvv" className="label flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    CVV
                  </label>
                  <input
                    id="cvv"
                    type="password"
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="123"
                    className="input"
                    maxLength={4}
                    required={paymentMethod === "card"}
                  />
                </div>
              </div>
            </>
          )}

          {paymentMethod === "iban" && (
            <div>
              <label htmlFor="iban" className="label">
                IBAN
              </label>
              <input
                id="iban"
                type="text"
                value={iban}
                onChange={handleIbanChange}
                placeholder="RO49AAAA1B31007593840000"
                className="input"
                required={paymentMethod === "iban"}
              />
              <p className="text-xs text-[var(--gray-600)] mt-1">
                Introdu IBAN-ul contului în care dorești să primești compensația
              </p>
            </div>
          )}

          {paymentMethod === "saved" && selectedSavedCard && (
            <div className="bg-[var(--gray-100)] p-4 rounded-lg">
              <p className="text-center text-sm">Vei primi compensația pe cardul selectat</p>
              <div className="mt-2 flex justify-center">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[var(--gray-600)]" />
                  <span className="font-medium">
                    •••• {savedCards.find((card) => card.id === selectedSavedCard)?.last4}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-2">
            <p className="text-sm text-[var(--gray-600)]">
              Datele tale sunt securizate și vor fi folosite doar pentru procesarea compensației de la asigurare.
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary mt-4"
            disabled={
              isSubmitting ||
              (paymentMethod === "card" && (!cardNumber || !cardHolder || !expiryDate || !cvv)) ||
              (paymentMethod === "iban" && !iban) ||
              (paymentMethod === "saved" && !selectedSavedCard)
            }
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <span>Se procesează...</span>
              </div>
            ) : (
              "Continuă"
            )}
          </button>
        </form>

        <p className="text-xs text-center text-[var(--gray-500)] mt-4">
          Informațiile cardului sunt criptate și securizate
        </p>

        {/* Canvas ascuns pentru procesarea fotografiilor */}
        <canvas ref={canvasRef} className="hidden"></canvas>
      </div>
    </div>
  )
}
