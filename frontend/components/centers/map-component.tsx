'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { WAREHOUSE_LOCATION } from '@/lib/mock-data'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Component to handle map view updates
interface MapControllerProps {
  selectedCenter: string | null
  centers: any[]
}

function MapController({ selectedCenter, centers }: MapControllerProps) {
  const map = useMap()
  
  useEffect(() => {
    if (selectedCenter) {
      const center = centers.find(c => c.id === selectedCenter)
      if (center) {
        map.flyTo([center.location.lat, center.location.lng], 13, { duration: 0.5 })
      }
    } else if (centers && centers.length > 0) {
      const bounds = L.latLngBounds(centers.map((c: any) => [c.location.lat, c.location.lng]))
      if (WAREHOUSE_LOCATION) {
        bounds.extend([WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng])
      }
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
    }
  }, [selectedCenter, centers, map])
  
  return null
}

// Get color based on priority score (heatmap effect)
function getPriorityColor(priorityScore: number, maxScore: number) {
  const ratio = priorityScore / maxScore
  
  if (ratio > 0.7) return { color: '#ef4444', fillColor: '#ef4444' } // Red - critical
  if (ratio > 0.5) return { color: '#f97316', fillColor: '#f97316' } // Orange - high
  if (ratio > 0.3) return { color: '#eab308', fillColor: '#eab308' } // Yellow - medium
  return { color: '#22c55e', fillColor: '#22c55e' } // Green - low
}

// Get radius based on people count
function getRadius(peopleCount: number, maxPeople: number) {
  const minRadius = 15
  const maxRadius = 40
  const ratio = peopleCount / maxPeople
  return minRadius + ratio * (maxRadius - minRadius)
}

interface MapComponentProps {
  centers: any[]
  selectedCenter: string | null
  onCenterSelect: (id: string) => void
  showHeatmap?: boolean
}

export function MapComponent({ 
  centers = [], 
  selectedCenter, 
  onCenterSelect,
  showHeatmap = true 
}: MapComponentProps) {
  if (!centers || !Array.isArray(centers)) return null

  const maxPriorityScore = Math.max(...centers.map((c: any) => c.priorityScore), 1)
  const maxPeopleCount = Math.max(...centers.map((c: any) => c.peopleCount), 1)
  
  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={[WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <MapController selectedCenter={selectedCenter} centers={centers} />
        
        {/* Warehouse marker */}
        <CircleMarker
          center={[WAREHOUSE_LOCATION.lat, WAREHOUSE_LOCATION.lng]}
          radius={12}
          pathOptions={{
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.8,
            weight: 3
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold text-sm">Central Warehouse</h3>
              <p className="text-xs text-gray-600">Main distribution hub</p>
            </div>
          </Popup>
        </CircleMarker>
        
        {/* Relief center markers */}
        {centers.map(center => {
          const colors = showHeatmap 
            ? getPriorityColor(center.priorityScore, maxPriorityScore)
            : { color: '#10b981', fillColor: '#10b981' }
          const radius = showHeatmap 
            ? getRadius(center.peopleCount, maxPeopleCount)
            : 20
          
          return (
            <CircleMarker
              key={center.id}
              center={[center.location.lat, center.location.lng]}
              radius={radius}
              pathOptions={{
                ...colors,
                fillOpacity: showHeatmap ? 0.6 : 0.8,
                weight: selectedCenter === center.id ? 4 : 2
              }}
              eventHandlers={{
                click: () => onCenterSelect?.(center.id)
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-sm">{center.name}</h3>
                  <div className="mt-2 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        center.status === 'critical' ? 'text-red-600' :
                        center.status === 'active' ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {center.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">People:</span>
                      <span className="font-medium">{center.peopleCount} / {center.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority Score:</span>
                      <span className="font-medium">{center.priorityScore}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shortage Level:</span>
                      <span className="font-medium">{center.shortageLevel}/10</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
