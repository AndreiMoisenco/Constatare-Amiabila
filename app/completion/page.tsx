"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CheckCircle, Download, FileText } from "lucide-react"
import { jsPDF } from "jspdf"

export default function Completion() {
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    // Obținem rolul utilizatorului
    if (typeof window !== "undefined") {
      setUserRole(localStorage.getItem("userRole") || "")
    }

    // Generăm PDF-ul automat la încărcarea paginii
    generatePdf()
  }, [])

  const generatePdf = async () => {
    setGeneratingPdf(true)

    try {
      // Creăm un nou document PDF
      const doc = new jsPDF()

      // Adăugăm titlul
      doc.setFontSize(18)
      doc.text("CONSTATARE AMIABILĂ DE ACCIDENT", 105, 20, { align: "center" })

      // Adăugăm data și ora
      doc.setFontSize(12)
      const currentDate = new Date().toLocaleDateString("ro-RO")
      const currentTime = new Date().toLocaleTimeString("ro-RO")
      doc.text(`Data accidentului: ${currentDate}`, 20, 40)
      doc.text(`Ora: ${currentTime}`, 20, 50)

      // Adăugăm locația
      doc.text("Localizare:", 20, 60)
      doc.text("Locul: București, Bd. Unirii", 30, 70)
      doc.text("Țara: România", 30, 80)

      // Adăugăm informații despre vehicule
      doc.text("VEHICUL A", 60, 100)
      doc.text("VEHICUL B", 150, 100)

      // Adăugăm informații despre șoferi
      doc.text("Șofer A:", 20, 120)
      doc.text("Nume: Popescu Ion", 30, 130)
      doc.text("Adresa: Str. Victoriei nr. 25, București", 30, 140)
      doc.text("Tel: 0712345678", 30, 150)

      doc.text("Șofer B:", 120, 120)
      doc.text("Nume: Ionescu Maria", 130, 130)
      doc.text("Adresa: Str. Libertății nr. 10, București", 130, 140)
      doc.text("Tel: 0723456789", 130, 150)

      // Adăugăm informații despre vehicule
      doc.text("Vehicul A:", 20, 170)
      doc.text("Marca: Dacia Logan", 30, 180)
      doc.text("Nr. înmatriculare: B 123 ABC", 30, 190)

      doc.text("Vehicul B:", 120, 170)
      doc.text("Marca: Volkswagen Golf", 130, 180)
      doc.text("Nr. înmatriculare: B 456 DEF", 130, 190)

      // Adăugăm informații despre asigurări
      doc.text("Asigurare A:", 20, 210)
      doc.text("Companie: Allianz-Țiriac", 30, 220)
      doc.text("Poliță nr: RO/12/345678", 30, 230)

      doc.text("Asigurare B:", 120, 210)
      doc.text("Companie: Groupama", 130, 220)
      doc.text("Poliță nr: RO/98/765432", 130, 230)

      // Adăugăm semnături
      doc.text("Semnătura șofer A:", 40, 260)
      doc.text("Semnătura șofer B:", 140, 260)

      // Adăugăm footer
      doc.setFontSize(10)
      doc.text("Document generat automat prin aplicația de Constatare Amiabilă", 105, 280, { align: "center" })

      // Salvăm PDF-ul și creăm un URL pentru descărcare
      const pdfBlob = doc.output("blob")
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
    } catch (error) {
      console.error("Eroare la generarea PDF-ului:", error)
    } finally {
      setGeneratingPdf(false)
    }
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <div className="completion-icon">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>

        <h1 className="page-title">Raport Finalizat</h1>
        <p className="page-subtitle">Mulțumim pentru completarea raportului de accident</p>

        <div className="completion-message">
          <p>Raportul dvs. a fost trimis cu succes. Ambele părți vor primi o copie a raportului prin email.</p>
        </div>

        {generatingPdf ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-10 h-10 border-4 border-t-[var(--blue)] border-r-[var(--gray-200)] border-b-[var(--gray-200)] border-l-[var(--gray-200)] rounded-full animate-spin mb-4"></div>
            <p className="text-[var(--gray-600)]">Se generează documentul PDF...</p>
          </div>
        ) : pdfUrl ? (
          <div className="flex flex-col gap-4 my-6">
            <div className="border-2 border-[var(--gray-200)] rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[rgba(0,102,255,0.1)] flex items-center justify-center">
                <FileText className="h-6 w-6 text-[var(--blue)]" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Constatare Amiabilă</h3>
                <p className="text-sm text-[var(--gray-600)]">Document PDF generat</p>
              </div>
              <a href={pdfUrl} download="constatare-amiabila.pdf" className="btn btn-secondary p-2">
                <Download className="h-5 w-5" />
              </a>
            </div>

            <a
              href={pdfUrl}
              download="constatare-amiabila.pdf"
              className="btn btn-primary flex items-center justify-center gap-2"
            >
              <Download className="h-5 w-5" />
              <span>Descarcă Documentul</span>
            </a>
          </div>
        ) : null}

        <Link href="/">
          <button className="btn btn-secondary">Înapoi la Pagina Principală</button>
        </Link>

        <p className="text-xs text-center text-gray mt-6">O confirmare a fost trimisă la adresa dvs. de email.</p>
      </div>
    </div>
  )
}
