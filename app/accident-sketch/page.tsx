"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Camera, Trash2, Check, RotateCw, Download } from "lucide-react"

export default function AccidentSketch() {
  const [userRole, setUserRole] = useState<string>("")
  const [cameraActive, setCameraActive] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [sketchMode, setSketchMode] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [sketchSaved, setSketchSaved] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sketchCanvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)

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

  useEffect(() => {
    // Inițializăm canvas-ul pentru schiță când intrăm în modul de schiță
    if (sketchMode && sketchCanvasRef.current) {
      const canvas = sketchCanvasRef.current
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2

      const context = canvas.getContext("2d")
      if (context) {
        context.scale(2, 2)
        context.lineCap = "round"
        context.strokeStyle = "red"
        context.lineWidth = 5
        contextRef.current = context

        // Dacă avem o imagine capturată, o desenăm pe canvas
        if (capturedImage) {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => {
            context.drawImage(img, 0, 0, canvas.width / 2, canvas.height / 2)
          }
          img.src = capturedImage
        }
      }
    }
  }, [sketchMode, capturedImage])

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
        setCapturedImage(photoData)
        stopCamera()
      }
    }
  }

  // Funcții pentru desenare
  const startDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    if (!contextRef.current || sketchSaved) return

    const { offsetX, offsetY } = getCoordinates(nativeEvent)
    contextRef.current.beginPath()
    contextRef.current.moveTo(offsetX, offsetY)
    setIsDrawing(true)
  }

  const finishDrawing = () => {
    if (!contextRef.current) return

    contextRef.current.closePath()
    setIsDrawing(false)
  }

  const draw = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !contextRef.current || sketchSaved) return

    const { offsetX, offsetY } = getCoordinates(nativeEvent)
    contextRef.current.lineTo(offsetX, offsetY)
    contextRef.current.stroke()
  }

  // Helper pentru a obține coordonatele din evenimente mouse sau touch
  const getCoordinates = (event: any) => {
    if (!sketchCanvasRef.current) return { offsetX: 0, offsetY: 0 }

    let offsetX, offsetY

    if (event.touches) {
      // Touch event
      const rect = sketchCanvasRef.current.getBoundingClientRect()
      offsetX = event.touches[0].clientX - rect.left
      offsetY = event.touches[0].clientY - rect.top
    } else {
      // Mouse event
      offsetX = event.offsetX
      offsetY = event.offsetY
    }

    return { offsetX, offsetY }
  }

  const saveSketch = () => {
    if (sketchCanvasRef.current) {
      const sketchData = sketchCanvasRef.current.toDataURL("image/png")
      localStorage.setItem("accidentSketch", sketchData)
      setSketchSaved(true)
    }
  }

  const resetSketch = () => {
    if (contextRef.current && sketchCanvasRef.current) {
      contextRef.current.clearRect(0, 0, sketchCanvasRef.current.width, sketchCanvasRef.current.height)

      // Redesen imaginea de fundal
      if (capturedImage) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          if (contextRef.current && sketchCanvasRef.current) {
            contextRef.current.drawImage(
              img,
              0,
              0,
              sketchCanvasRef.current.width / 2,
              sketchCanvasRef.current.height / 2,
            )
          }
        }
        img.src = capturedImage
      }

      setSketchSaved(false)
    }
  }

  const downloadSketch = () => {
    if (sketchCanvasRef.current) {
      const link = document.createElement("a")
      link.download = "schita-accident.png"
      link.href = sketchCanvasRef.current.toDataURL("image/png")
      link.click()
    }
  }

  const continueToNextStep = () => {
    router.push("/questionnaire?step=1")
  }

  // Dacă utilizatorul nu are rolul de victimă, nu afișăm nimic
  if (userRole !== "victima" && userRole !== "") {
    return null
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <h1 className="page-title">Schiță Accident</h1>
        <p className="page-subtitle">
          {!capturedImage
            ? "Fotografiază locul accidentului pentru a crea o schiță"
            : !sketchMode
              ? "Continuă pentru a desena pe fotografie"
              : "Desenează pe fotografie pentru a marca detalii importante"}
        </p>

        {!capturedImage ? (
          // Etapa 1: Captură fotografie
          <div className="relative w-full h-80 bg-black rounded-2xl overflow-hidden mb-4">
            {cameraActive ? (
              <>
                <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
                <button
                  onClick={capturePhoto}
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center"
                >
                  <div className="w-14 h-14 rounded-full border-2 border-[var(--gray-300)]"></div>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white">
                <Camera className="w-16 h-16 text-white opacity-50 mb-4" />
                <p className="text-lg font-medium">Fotografiază locul accidentului</p>
                <p className="text-sm opacity-70 max-w-[80%] text-center mt-2">
                  Asigură-te că fotografia include toate vehiculele și detaliile relevante
                </p>
              </div>
            )}
          </div>
        ) : sketchMode ? (
          // Etapa 3: Desenare pe fotografie
          <div className="relative w-full h-80 bg-black rounded-2xl overflow-hidden mb-4">
            <canvas
              ref={sketchCanvasRef}
              className="absolute inset-0 w-full h-full touch-none"
              onMouseDown={startDrawing}
              onMouseUp={finishDrawing}
              onMouseMove={draw}
              onMouseLeave={finishDrawing}
              onTouchStart={startDrawing}
              onTouchEnd={finishDrawing}
              onTouchMove={draw}
            />

            {sketchSaved && (
              <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <Check className="h-4 w-4" />
                <span>Salvat</span>
              </div>
            )}
          </div>
        ) : (
          // Etapa 2: Previzualizare fotografie
          <div className="relative w-full h-80 bg-black rounded-2xl overflow-hidden mb-4">
            <img
              src={capturedImage || "/placeholder.svg"}
              alt="Fotografie loc accident"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Canvas ascuns pentru procesarea fotografiilor */}
        <canvas ref={canvasRef} className="hidden"></canvas>

        {/* Butoane de acțiune */}
        <div className="flex gap-4 mt-6">
          {!capturedImage ? (
            // Butoane pentru etapa de captură
            <button
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              onClick={cameraActive ? stopCamera : startCamera}
            >
              <Camera className="w-5 h-5" />
              <span>{cameraActive ? "Oprește Camera" : "Pornește Camera"}</span>
            </button>
          ) : sketchMode ? (
            // Butoane pentru etapa de desenare
            <>
              <button
                className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                onClick={resetSketch}
                disabled={sketchSaved}
              >
                <RotateCw className="w-5 h-5" />
                <span>Resetează</span>
              </button>

              {sketchSaved ? (
                <button
                  className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                  onClick={downloadSketch}
                >
                  <Download className="w-5 h-5" />
                  <span>Descarcă</span>
                </button>
              ) : (
                <button className="btn btn-primary flex-1 flex items-center justify-center gap-2" onClick={saveSketch}>
                  <Check className="w-5 h-5" />
                  <span>Salvează</span>
                </button>
              )}
            </>
          ) : (
            // Butoane pentru etapa de previzualizare
            <>
              <button
                className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                onClick={() => {
                  setCapturedImage(null)
                  setSketchMode(false)
                }}
              >
                <Trash2 className="w-5 h-5" />
                <span>Șterge</span>
              </button>

              <button
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                onClick={() => setSketchMode(true)}
              >
                <Check className="w-5 h-5" />
                <span>Continuă</span>
              </button>
            </>
          )}
        </div>

        {sketchSaved && (
          <button className="btn btn-primary mt-4 w-full" onClick={continueToNextStep}>
            Continuă la Chestionar
          </button>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm text-[var(--gray-600)]">
            {!capturedImage
              ? "Fotografiază locul accidentului din perspectivă de sus"
              : !sketchMode
                ? "Verifică dacă fotografia este clară și conține toate detaliile"
                : "Desenează pe fotografie pentru a marca poziția vehiculelor și alte detalii relevante"}
          </p>
        </div>
      </div>
    </div>
  )
}
