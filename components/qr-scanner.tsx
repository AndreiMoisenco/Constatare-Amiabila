"use client"

import { useState, useEffect } from "react"
import { Html5Qrcode } from "html5-qrcode"

interface QrScannerProps {
  onScan: (result: string) => void
}

export function QrScanner({ onScan }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannerInstance, setScannerInstance] = useState<Html5Qrcode | null>(null)

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5Qrcode("qr-reader")
    setScannerInstance(scanner)

    // Cleanup on unmount
    return () => {
      if (scanner && isScanning) {
        scanner.stop().catch(console.error)
      }
    }
  }, [])

  const startScanner = () => {
    if (!scannerInstance) return

    setIsScanning(true)
    const config = { fps: 10, qrbox: { width: 200, height: 200 } }

    scannerInstance
      .start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          onScan(decodedText)
          stopScanner()
        },
        (errorMessage) => {
          console.log(errorMessage)
        },
      )
      .catch((err) => {
        console.error("Failed to start scanner", err)
      })
  }

  const stopScanner = () => {
    if (scannerInstance && isScanning) {
      scannerInstance.stop().catch(console.error)
      setIsScanning(false)
    }
  }

  useEffect(() => {
    if (scannerInstance && !isScanning) {
      startScanner()
    }

    return () => {
      if (scannerInstance && isScanning) {
        stopScanner()
      }
    }
  }, [scannerInstance])

  return (
    <div className="flex flex-col items-center gap-4">
      <div id="qr-reader" className="qr-reader"></div>
      <p className="text-sm text-gray text-center">Poziționează codul QR în cadru pentru a-l scana</p>
    </div>
  )
}
