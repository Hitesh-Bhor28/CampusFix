import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import { useSelector } from 'react-redux'
import L from 'leaflet'
import 'leaflet.heat'
import 'leaflet/dist/leaflet.css'

const HeatmapLayer = ({ points }) => {
  const map = useMap()

  useEffect(() => {
    if (!points || !points.length) return undefined

    const heatLayer = L.heatLayer(points, { radius: 25, blur: 15 }).addTo(map)

    return () => {
      map.removeLayer(heatLayer)
    }
  }, [map, points])

  return null
}

const HeatmapWidget = () => {
  const complaintsList = useSelector((store) => store.complaints?.complaintsList)

  const formattedPoints = Array.isArray(complaintsList)
    ? complaintsList
        .filter(
          (complaint) =>
            Array.isArray(complaint.location?.coordinates) &&
            complaint.location.coordinates.length === 2,
        )
        .map((complaint) => [
          complaint.location.coordinates[1],
          complaint.location.coordinates[0],
          500,
        ])
    : []

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-xl shadow-black/30">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">Heatmap</p>
        <h2 className="mt-2 text-2xl font-semibold">Complaint Density</h2>
        <p className="mt-1 text-sm text-white/70">
          Visualize complaint hotspots across the city in real time.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <MapContainer
          center={[19.9975, 73.7898]}
          zoom={12}
          className="h-[400px] w-full"
          scrollWheelZoom={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {formattedPoints.length > 0 ? <HeatmapLayer points={formattedPoints} /> : null}
        </MapContainer>
      </div>
    </div>
  )
}

export default HeatmapWidget
