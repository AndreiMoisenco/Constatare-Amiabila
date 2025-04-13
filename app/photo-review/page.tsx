"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, X, ChevronLeft, ChevronRight } from "lucide-react"

// Simulăm fotografiile încărcate de victimă
const mockPhotos = [
  {
    id: "panoramic",
    label: "Vedere panoramică a accidentului",
    url: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "damage",
    label: "Daune vehicul",
    url: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "license-plate-own",
    label: "Număr înmatriculare propriu",
    url: "/placeholder.svg?height=400&width=600",
  },
  {
    id: "license-plate-other",
    label: "Număr înmatriculare celălalt vehicul",
    url: "/placeholder.svg?height=400&width=600",
  },
]

export default function PhotoReview() {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [approvedPhotos, setApprovedPhotos] = useState<string[]>([])
  const [rejectedPhotos, setRejectedPhotos] = useState<string[]>([])
  const [userRole, setUserRole] = useState<string>("")
  const [photos, setPhotos] = useState<any[]>([])

  const router = useRouter()

  useEffect(() => {
    // Verificăm dacă utilizatorul are rolul de vinovat
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("userRole") || ""
      setUserRole(role)

      // Dacă nu este vinovat, redirecționăm
      if (role !== "vinovat") {
        router.push("/")
      }

      // În mod normal, aici am încărca fotografiile de la server
      // Pentru demo, folosim fotografiile mock
      setPhotos(mockPhotos)
    }
  }, [router])

  const currentPhoto = photos[currentPhotoIndex] || mockPhotos[0]
  const totalPhotos = photos.length
  const allPhotosReviewed = approvedPhotos.length + rejectedPhotos.length === totalPhotos

  const handleApprove = () => {
    setApprovedPhotos([...approvedPhotos, currentPhoto.id])
    goToNextPhoto()
  }

  const handleReject = () => {
    setRejectedPhotos([...rejectedPhotos, currentPhoto.id])
    goToNextPhoto()
  }

  const goToNextPhoto = () => {
    if (currentPhotoIndex < totalPhotos - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    }
  }

  const goToPrevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1)
    }
  }

  const handleComplete = () => {
    // Salvăm aprobările în localStorage
    localStorage.setItem("approvedPhotos", JSON.stringify(approvedPhotos))
    localStorage.setItem("rejectedPhotos", JSON.stringify(rejectedPhotos))

    // Navigăm la pagina de finalizare
    router.push(`/completion`)
  }

  const isPhotoReviewed = (photoId: string) => {
    return approvedPhotos.includes(photoId) || rejectedPhotos.includes(photoId)
  }

  const getPhotoStatus = (photoId: string) => {
    if (approvedPhotos.includes(photoId)) return "approved"
    if (rejectedPhotos.includes(photoId)) return "rejected"
    return "pending"
  }

  // Dacă utilizatorul nu are rolul de vinovat, nu afișăm nimic (redirecționarea se face în useEffect)
  if (userRole !== "vinovat" && userRole !== "") {
    return null
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <h1 className="page-title">Verificare Fotografii</h1>
        <p className="page-subtitle">Verificați și confirmați fotografiile încărcate de celălalt participant</p>

        {/* Progres fotografii */}
        <div className="flex justify-between mb-4">
          {photos.map((photo, index) => (
            <div
              key={photo.id}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs cursor-pointer ${
                index === currentPhotoIndex
                  ? "border-2 border-[var(--blue)] text-[var(--blue)]"
                  : getPhotoStatus(photo.id) === "approved"
                    ? "bg-green-500 text-white"
                    : getPhotoStatus(photo.id) === "rejected"
                      ? "bg-red-500 text-white"
                      : "bg-[var(--gray-200)] text-[var(--gray-600)]"
              }`}
              onClick={() => setCurrentPhotoIndex(index)}
            >
              {index + 1}
            </div>
          ))}
        </div>

        {/* Fotografie curentă */}
        <div className="relative w-full h-80 bg-[var(--gray-100)] rounded-xl overflow-hidden mb-6">
          <img
            src={currentPhoto.url || "/placeholder.svg"}
            alt={currentPhoto.label}
            className="w-full h-full object-cover"
          />

          {isPhotoReviewed(currentPhoto.id) && (
            <div
              className={`absolute inset-0 flex items-center justify-center ${
                approvedPhotos.includes(currentPhoto.id) ? "bg-green-500 bg-opacity-20" : "bg-red-500 bg-opacity-20"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full ${
                  approvedPhotos.includes(currentPhoto.id) ? "bg-green-500" : "bg-red-500"
                } flex items-center justify-center`}
              >
                {approvedPhotos.includes(currentPhoto.id) ? (
                  <Check className="h-10 w-10 text-white" />
                ) : (
                  <X className="h-10 w-10 text-white" />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-center mb-6">
          <h3 className="font-medium text-lg">{currentPhoto.label}</h3>
          <p className="text-sm text-[var(--gray-600)]">
            Fotografie {currentPhotoIndex + 1} din {totalPhotos}
          </p>
        </div>

        {/* Butoane de acțiune */}
        <div className="flex gap-4">
          <button
            className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
            onClick={goToPrevPhoto}
            disabled={currentPhotoIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Înapoi</span>
          </button>

          {!isPhotoReviewed(currentPhoto.id) ? (
            <>
              <button
                className="btn flex-1 flex items-center justify-center gap-2 bg-red-500 text-white hover:bg-red-600"
                onClick={handleReject}
              >
                <X className="h-5 w-5" />
                <span>Refuz</span>
              </button>

              <button
                className="btn flex-1 flex items-center justify-center gap-2 bg-green-500 text-white hover:bg-green-600"
                onClick={handleApprove}
              >
                <Check className="h-5 w-5" />
                <span>Accept</span>
              </button>
            </>
          ) : (
            <button
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              onClick={goToNextPhoto}
              disabled={currentPhotoIndex === totalPhotos - 1}
            >
              <span>Următoarea</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {allPhotosReviewed && (
          <button className="btn btn-primary mt-6 w-full" onClick={handleComplete}>
            Finalizează Raportul
          </button>
        )}
      </div>
    </div>
  )
}
