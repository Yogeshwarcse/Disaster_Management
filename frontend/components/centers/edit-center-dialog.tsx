'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useStore } from '@/lib/store'
import { MapPin, Edit } from 'lucide-react'

// Fix generic Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ position, setPosition }: { position: any, setPosition: any }) {
  useMapEvents({
    click(e: any) {
      setPosition(e.latlng)
    },
  })
  return position === null ? null : (
    <Marker position={position}></Marker>
  )
}

export function EditCenterDialog({ center }: { center: any }) {
  const [open, setOpen] = useState(false)
  const updateCenter = useStore((state: any) => state.updateCenter)
  
  const [name, setName] = useState(center.name)
  const [capacity, setCapacity] = useState(center.capacity.toString())
  const [peopleCount, setPeopleCount] = useState(center.peopleCount.toString())
  const [status, setStatus] = useState(center.status)
  const [position, setPosition] = useState<any>({ lat: center.location.lat, lng: center.location.lng })
  
  useEffect(() => {
    setName(center.name)
    setCapacity(center.capacity.toString())
    setPeopleCount(center.peopleCount.toString())
    setStatus(center.status)
    setPosition({ lat: center.location.lat, lng: center.location.lng })
  }, [center])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!position) {
      alert("Please select a location on the map.")
      return
    }
    
    await updateCenter(center.id, {
      name,
      capacity: parseInt(capacity) || 0,
      peopleCount: parseInt(peopleCount) || 0,
      status,
      location: { lat: position.lat, lng: position.lng }
    })
    
    setOpen(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex-1">
          <Edit className="h-4 w-4 mr-2" />
          Edit Center
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-background">
        <DialogHeader>
          <DialogTitle>Edit Relief Center</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-name">Center Name</Label>
              <Input id="edit-name" required value={name} onChange={e => setName(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity (People)</Label>
              <Input id="edit-capacity" required type="number" min="1" value={capacity} onChange={e => setCapacity(e.target.value)} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-peopleCount">Current People Count</Label>
              <Input id="edit-peopleCount" type="number" min="0" value={peopleCount} onChange={e => setPeopleCount(e.target.value)} />
            </div>
            
            <div className="col-span-2 space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-2 space-y-2 z-10">
              <Label>Location (Click on map to change pin)</Label>
              <div className="h-[200px] border rounded-md overflow-hidden relative">
                <MapContainer center={[position.lat, position.lng] as any} zoom={12} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
              {position && (
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  Selected: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="mr-2">Cancel</Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
