"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MapPin, Locate } from "lucide-react"

export default function LocationSelection() {
  const [location, setLocation] = useState("")
  const [mapSelection, setMapSelection] = useState({ lat: 0, lng: 0 })
  const [hasSelectedLocation, setHasSelectedLocation] = useState(false)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const lobbyCode = searchParams.get("code") || ""

  // Inițializare hartă map.md
  useEffect(() => {
    // Simulăm încărcarea API-ului map.md
    // În implementarea reală, aici ar trebui să încarci scriptul map.md și să inițializezi harta
    const loadMapScript = () => {
      setTimeout(() => {
        console.log("Map API loaded")
        setMapLoaded(true)

        // Simulăm crearea unei instanțe de hartă
        setMapInstance({
          setCenter: (lat: number, lng: number) => {
            console.log(`Map centered at ${lat}, ${lng}`)
          },
          addMarker: (lat: number, lng: number) => {
            console.log(`Marker added at ${lat}, ${lng}`)
          },
        })
      }, 1000)
    }

    loadMapScript()
  }, [])

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation nu este suportat de browser-ul tău")
      return
    }

    setIsLoadingLocation(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setMapSelection({ lat: latitude, lng: longitude })
        setLocation(`Locație detectată (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`)
        setHasSelectedLocation(true)
        setIsLoadingLocation(false)

        // Dacă harta e încărcată, actualizăm poziția
        if (mapInstance) {
          mapInstance.setCenter(latitude, longitude)
          mapInstance.addMarker(latitude, longitude)
        }
      },
      (error) => {
        setIsLoadingLocation(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Permisiunea pentru localizare a fost refuzată")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("Informațiile despre locație nu sunt disponibile")
            break
          case error.TIMEOUT:
            setLocationError("Timpul pentru obținerea locației a expirat")
            break
          default:
            setLocationError("A apărut o eroare la obținerea locației")
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const handleLocationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value)
    setHasSelectedLocation(e.target.value.trim().length > 0)
  }

  const handleMapClick = (lat: number, lng: number) => {
    setMapSelection({ lat, lng })
    setHasSelectedLocation(true)
    setLocation(`Locație selectată (${lat.toFixed(4)}, ${lng.toFixed(4)})`)

    // Actualizăm poziția pe hartă
    if (mapInstance) {
      mapInstance.setCenter(lat, lng)
      mapInstance.addMarker(lat, lng)
    }
  }

  const proceedToNextStep = () => {
    router.push(`/damage-selection?code=${lobbyCode}`)
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="card">
        <h1 className="page-title">Locația Accidentului</h1>
        <p className="page-subtitle">Selectează locația unde a avut loc accidentul</p>

        <div className="map-container">
          {!mapLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--gray-100)]">
              <div className="w-10 h-10 border-4 border-t-[var(--blue)] border-r-[var(--gray-200)] border-b-[var(--gray-200)] border-l-[var(--gray-200)] rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-10 w-10 mx-auto text-[var(--gray-500)]" />
                  <p className="text-sm text-gray mt-2">Apasă pe hartă pentru a selecta locația</p>
                </div>
              </div>
              <div
                className="absolute inset-0 cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect()
                  const x = e.clientX - rect.left
                  const y = e.clientY - rect.top
                  const lat = 44.4 - (y / rect.height) * 0.2
                  const lng = 26.1 + (x / rect.width) * 0.2
                  handleMapClick(lat, lng)
                }}
              />

              {hasSelectedLocation && mapSelection.lat !== 0 && (
                <div
                  className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{
                    top: `${50 - ((mapSelection.lat - 44.4) / 0.2) * 100}%`,
                    left: `${50 + ((mapSelection.lng - 26.1) / 0.2) * 100}%`,
                  }}
                >
                  <div className="w-4 h-4 bg-[var(--blue)] rounded-full animate-pulse" />
                </div>
              )}

              {/* Buton pentru localizare GPS */}
              <button
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
                className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md border border-[var(--gray-300)] hover:bg-[var(--gray-100)]"
                aria-label="Detectează locația mea"
              >
                <Locate className="h-5 w-5 text-[var(--blue)]" />
              </button>
            </>
          )}
        </div>

        {locationError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm">
            {locationError}
          </div>
        )}

        {isLoadingLocation && (
          <div className="text-center text-[var(--gray-600)] text-sm mb-4">Se detectează locația ta...</div>
        )}

        <div className="mb-6">
          <label htmlFor="location" className="label">
            Adresa Locației
          </label>
          <input
            id="location"
            type="text"
            placeholder="Introdu adresa sau selectează pe hartă"
            value={location}
            onChange={handleLocationInput}
            className="input"
          />
        </div>

        <button className="btn btn-primary" onClick={proceedToNextStep} disabled={!hasSelectedLocation}>
          Continuă
        </button>
      </div>
    </div>
  )
}
