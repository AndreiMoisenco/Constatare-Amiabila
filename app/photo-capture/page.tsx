"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, X, Check, ChevronLeft, ChevronRight } from "lucide-react"

// Tipurile de fotografii necesare
const requiredPhotoTypes = [
  {
    id: "panoramic",
    label: "Vedere panoramică a accidentului",
    description: "Captează întreaga scenă a accidentului",
  },
  {
    id: "damage",
    label: "Daune vehicul",
    description: "Fotografiază detaliat zonele avariate",
  },
  {
    id: "license-plate-own",
    label: "Număr înmatriculare propriu",
    description: "Asigură-te că numărul este vizibil și clar",
  },
  {
    id: "license-plate-other",
    label: "Număr înmatriculare celălalt vehicul",
    description: "Asigură-te că numărul este vizibil și clar",
  },
]

export default function PhotoCapture() {
  const [photos, setPhotos] = useState<{ [key: string]: string }>({})
  const [currentPhotoType, setCurrentPhotoType] = useState(requiredPhotoTypes[0].id)
  const [cameraActive, setCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [userRole, setUserRole] = useState<string>("")

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

  // Inițializare cameră
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })

      setStream(mediaStream)
      setCameraActive(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch (error) {
      console.error("Eroare la accesarea camerei:", error)
      alert("Nu s-a putut accesa camera. Te rugăm să verifici permisiunile.")
    }
  }

  // Oprire cameră
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setCameraActive(false)
  }

  // Curățare la demontarea componentei
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  // Captură fotografie
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (context) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const photoData = canvas.toDataURL("image/jpeg")
        setPhotos((prev) => ({ ...prev, [currentPhotoType]: photoData }))
        stopCamera()
      }
    }
  }

  // Ștergere fotografie
  const deletePhoto = (photoType: string) => {
    setPhotos((prev) => {
      const newPhotos = { ...prev }
      delete newPhotos[photoType]
      return newPhotos
    })
  }

  // Navigare la următorul tip de fotografie
  const goToNextPhotoType = () => {
    const currentIndex = requiredPhotoTypes.findIndex((type) => type.id === currentPhotoType)
    if (currentIndex < requiredPhotoTypes.length - 1) {
      setCurrentPhotoType(requiredPhotoTypes[currentIndex + 1].id)
    }
  }

  // Navigare la tipul anterior de fotografie
  const goToPrevPhotoType = () => {
    const currentIndex = requiredPhotoTypes.findIndex((type) => type.id === currentPhotoType)
    if (currentIndex > 0) {
      setCurrentPhotoType(requiredPhotoTypes[currentIndex - 1].id)
    }
  }

  // Verificare dacă toate fotografiile necesare au fost făcute
  const allPhotosCompleted = requiredPhotoTypes.every((type) => photos[type.id])

  // Finalizare și navigare la următorul pas
  const handleComplete = () => {
    if (allPhotosCompleted) {
      // Salvăm fotografiile în localStorage (în practică ar trebui trimise la server)
      localStorage.setItem("accidentPhotos", JSON.stringify(photos))
      router.push(`/accident-sketch`)
    } else {
      alert("Te rugăm să faci toate fotografiile necesare")
    }
  }

  // Găsirea tipului curent de fotografie
  const currentPhotoTypeInfo = requiredPhotoTypes.find((type) => type.id === currentPhotoType)

  // Dacă utilizatorul nu are rolul de victimă, nu afișăm nimic (redirecționarea se face în useEffect)
  if (userRole !== "victima" && userRole !== "") {
    return null
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <h1 className="page-title">Fotografii Accident</h1>
        <p className="page-subtitle">Captează fotografii pentru documentarea accidentului</p>

        {/* Progres fotografii */}
        <div className="flex justify-between mb-4">
          {requiredPhotoTypes.map((type, index) => (
            <div
              key={type.id}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                photos[type.id]
                  ? "bg-[var(--blue)] text-white"
                  : currentPhotoType === type.id
                    ? "border-2 border-[var(--blue)] text-[var(--blue)]"
                    : "bg-[var(--gray-200)] text-[var(--gray-600)]"
              }`}
              onClick={() => setCurrentPhotoType(type.id)}
            >
              {index + 1}
            </div>
          ))}
        </div>

        {/* Zona de afișare cameră/fotografie - Design modernizat */}
        <div className="relative w-full h-80 bg-black rounded-2xl overflow-hidden mb-4">
          {cameraActive ? (
            <>
              <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />

              {/* Overlay cu instrucțiuni */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 text-white px-6 py-3 rounded-lg text-center max-w-[80%]">
                  <p className="font-medium">{currentPhotoTypeInfo?.label}</p>
                  <p className="text-sm opacity-80">{currentPhotoTypeInfo?.description}</p>
                </div>
              </div>

              {/* Buton captură modernizat */}
              <button
                onClick={capturePhoto}
                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center"
              >
                <div className="w-14 h-14 rounded-full border-2 border-[var(--gray-300)]"></div>
              </button>
            </>
          ) : photos[currentPhotoType] ? (
            <div className="relative w-full h-full">
              <img
                src={photos[currentPhotoType] || "/placeholder.svg"}
                alt={`Fotografie ${currentPhotoTypeInfo?.label}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => deletePhoto(currentPhotoType)}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black bg-opacity-50 flex items-center justify-center"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-white">
              <Camera className="w-16 h-16 text-white opacity-50 mb-4" />
              <p className="text-lg font-medium">{currentPhotoTypeInfo?.label}</p>
              <p className="text-sm opacity-70 max-w-[80%] text-center mt-2">{currentPhotoTypeInfo?.description}</p>
            </div>
          )}
        </div>

        {/* Canvas ascuns pentru procesarea fotografiilor */}
        <canvas ref={canvasRef} className="hidden"></canvas>

        {/* Butoane de navigare și acțiune */}
        <div className="flex gap-4 mt-6">
          {!cameraActive && (
            <>
              <button className="btn btn-secondary flex-1 flex items-center justify-center gap-2" onClick={startCamera}>
                <Camera className="w-5 h-5" />
                <span>{photos[currentPhotoType] ? "Refă fotografia" : "Fă o fotografie"}</span>
              </button>

              <div className="flex gap-2">
                <button
                  className="btn btn-secondary p-3"
                  onClick={goToPrevPhotoType}
                  disabled={requiredPhotoTypes.findIndex((type) => type.id === currentPhotoType) === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  className="btn btn-secondary p-3"
                  onClick={goToNextPhotoType}
                  disabled={
                    requiredPhotoTypes.findIndex((type) => type.id === currentPhotoType) ===
                    requiredPhotoTypes.length - 1
                  }
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {!cameraActive && (
          <button
            className="btn btn-primary mt-4 flex items-center justify-center gap-2"
            onClick={handleComplete}
            disabled={!allPhotosCompleted}
          >
            <Check className="w-5 h-5" />
            <span>Finalizează Fotografiile</span>
          </button>
        )}

        {/* Indicator fotografii completate */}
        <div className="mt-4 text-center">
          <p className="text-sm text-[var(--gray-600)]">
            {Object.keys(photos).length} din {requiredPhotoTypes.length} fotografii completate
          </p>
        </div>
      </div>
    </div>
  )
}
