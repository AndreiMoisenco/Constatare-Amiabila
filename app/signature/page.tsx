"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Check, Download } from "lucide-react"

export default function Signature() {
  const [isDrawing, setIsDrawing] = useState(false)
  const [signatureSaved, setSignatureSaved] = useState(false)
  const [userRole, setUserRole] = useState<string>("")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)

  const router = useRouter()

  useEffect(() => {
    // Obținem rolul utilizatorului
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("userRole") || "")
    }
  }, [])

  useEffect(() => {
    // Inițializăm canvas-ul pentru semnătură
    if (canvasRef.current) {
      const canvas = canvasRef.current
      canvas.width = canvas.offsetWidth * 2
      canvas.height = canvas.offsetHeight * 2

      const context = canvas.getContext("2d")
      if (context) {
        context.scale(2, 2)
        context.lineCap = "round"
        context.strokeStyle = "black"
        context.lineWidth = 2
        contextRef.current = context
      }
    }
  }, [])

  // Funcții pentru desenare
  const startDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    if (!contextRef.current || signatureSaved) return

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
    if (!isDrawing || !contextRef.current || signatureSaved) return

    const { offsetX, offsetY } = getCoordinates(nativeEvent)
    contextRef.current.lineTo(offsetX, offsetY)
    contextRef.current.stroke()
  }

  // Helper pentru a obține coordonatele din evenimente mouse sau touch
  const getCoordinates = (event: any) => {
    if (!canvasRef.current) return { offsetX: 0, offsetY: 0 }

    let offsetX, offsetY

    if (event.touches) {
      // Touch event
      const rect = canvasRef.current.getBoundingClientRect()
      offsetX = event.touches[0].clientX - rect.left
      offsetY = event.touches[0].clientY - rect.top
    } else {
      // Mouse event
      offsetX = event.offsetX
      offsetY = event.offsetY
    }

    return { offsetX, offsetY }
  }

  const saveSignature = () => {
    if (canvasRef.current) {
      const signatureData = canvasRef.current.toDataURL("image/png")
      localStorage.setItem("signature", signatureData)
      setSignatureSaved(true)
    }
  }

  const resetSignature = () => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      setSignatureSaved(false)
    }
  }

  const downloadSignature = () => {
    if (canvasRef.current) {
      const link = document.createElement("a")
      link.download = "semnatura.png"
      link.href = canvasRef.current.toDataURL("image/png")
      link.click()
    }
  }

  const continueToNextStep = () => {
    router.push("/completion")
  }

  // Verificăm dacă canvas-ul este gol
  const isCanvasEmpty = () => {
    if (!canvasRef.current || !contextRef.current) return true

    const canvas = canvasRef.current
    const context = canvas.getContext("2d")
    if (!context) return true

    const pixelBuffer = new Uint32Array(context.getImageData(0, 0, canvas.width, canvas.height).data.buffer)

    return !pixelBuffer.some((color) => color !== 0)
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <h1 className="page-title">Semnătură Electronică</h1>
        <p className="page-subtitle">Semnează pentru a finaliza raportul de accident</p>

        <div className="relative w-full h-48 border-2 border-[var(--gray-300)] rounded-xl overflow-hidden mb-4 bg-white">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full touch-none"
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            onMouseLeave={finishDrawing}
            onTouchStart={startDrawing}
            onTouchEnd={finishDrawing}
            onTouchMove={draw}
          />

          {signatureSaved && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>Salvat</span>
            </div>
          )}

          {!isDrawing && !signatureSaved && isCanvasEmpty() && (
            <div className="absolute inset-0 flex items-center justify-center text-[var(--gray-400)] pointer-events-none">
              Semnează aici
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-6">
          <button
            className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
            onClick={resetSignature}
            disabled={signatureSaved && isCanvasEmpty()}
          >
            <Trash2 className="w-5 h-5" />
            <span>Șterge</span>
          </button>

          {signatureSaved ? (
            <button
              className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
              onClick={downloadSignature}
            >
              <Download className="w-5 h-5" />
              <span>Descarcă</span>
            </button>
          ) : (
            <button
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              onClick={saveSignature}
              disabled={isCanvasEmpty()}
            >
              <Check className="w-5 h-5" />
              <span>Salvează</span>
            </button>
          )}
        </div>

        {signatureSaved && (
          <button className="btn btn-primary mt-4 w-full" onClick={continueToNextStep}>
            Finalizează Raportul
          </button>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm text-[var(--gray-600)]">
            Semnătura ta electronică confirmă că informațiile furnizate sunt corecte și complete
          </p>
        </div>
      </div>
    </div>
  )
}
