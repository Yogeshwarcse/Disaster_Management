'use client'

import dynamic from 'next/dynamic'
import { WAREHOUSE_LOCATION } from '@/lib/mock-data'

// Dynamically import the entire map component to avoid SSR issues
const MapComponent = dynamic(
  () => import('./map-component').then((mod) => mod.MapComponent),
  { ssr: false }
)

interface ReliefCenterMapProps {
  centers?: any[]
  selectedCenter: string | null
  onCenterSelect: (id: string) => void
  showHeatmap?: boolean
}

export function ReliefCenterMap({ 
  centers = [], 
  selectedCenter, 
  onCenterSelect,
  showHeatmap = true 
}: ReliefCenterMapProps) {
  return (
    <div className="h-full w-full">
      <MapComponent 
        centers={centers}
        selectedCenter={selectedCenter}
        onCenterSelect={onCenterSelect}
        showHeatmap={showHeatmap}
      />
    </div>
  )
}
