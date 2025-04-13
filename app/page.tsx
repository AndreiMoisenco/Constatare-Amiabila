"use client"

import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <div className="flex justify-center mb-6">
          <Image
            src="/placeholder.svg?height=80&width=200"
            alt="Logo"
            width={200}
            height={80}
            className="h-16 w-auto"
          />
        </div>

        <h1 className="page-title">Raport de Accident</h1>
        <p className="page-subtitle">Creează sau alătură-te unui raport de accident</p>

        <div className="flex flex-col gap-4 mt-6">
          <Link href="/create-lobby" className="w-full">
            <button className="btn btn-primary">Creează Raport Nou</button>
          </Link>

          <Link href="/join-lobby" className="w-full">
            <button className="btn btn-secondary">Alătură-te unui Raport</button>
          </Link>
        </div>
      </div>
    </div>
  )
}
