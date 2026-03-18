'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/lib/store'
import { 
  MapPin, 
  Users, 
  AlertTriangle, 
  Package, 
  Truck, 
  X,
  TrendingUp 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const EditCenterDialog = dynamic(
  () => import('@/components/centers/edit-center-dialog').then(mod => mod.EditCenterDialog),
  { ssr: false }
)

export function CenterDetailsPanel({ center, onClose }: { center: any, onClose: () => void }) {
  const inventory = useStore((state: any) => state.inventory)
  const dispatches = useStore((state: any) => state.dispatches)
  const updateDispatchStatus = useStore((state: any) => state.updateDispatchStatus)
  
  const incomingDispatches = dispatches.filter((d: any) => 
    d.centerId === center.id && ['pending', 'in-transit'].includes(d.status)
  )
  
  const capacityPercentage = (center.peopleCount / center.capacity) * 100
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-destructive text-destructive-foreground'
      case 'active': return 'bg-chart-3 text-background'
      case 'stable': return 'bg-primary text-primary-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }
  
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">{center.name}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getStatusColor(center.status)}>
              {center.status.toUpperCase()}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Priority: {center.priorityScore}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location */}
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <MapPin className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Location</p>
            <p className="text-xs text-muted-foreground">
              {center.location.lat.toFixed(4)}, {center.location.lng.toFixed(4)}
            </p>
          </div>
        </div>
        
        {/* Capacity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Capacity</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {center.peopleCount} / {center.capacity}
            </span>
          </div>
          <Progress value={capacityPercentage} className={cn(
            capacityPercentage > 90 && "[&>div]:bg-destructive",
            capacityPercentage > 70 && capacityPercentage <= 90 && "[&>div]:bg-chart-3"
          )} />
          <p className="text-xs text-muted-foreground">
            {capacityPercentage.toFixed(0)}% capacity utilized
          </p>
        </div>
        
        {/* Shortage Level */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn(
                "h-4 w-4",
                center.shortageLevel > 7 ? "text-destructive" :
                center.shortageLevel > 4 ? "text-chart-3" : "text-primary"
              )} />
              <span className="text-sm font-medium">Shortage Level</span>
            </div>
            <span className={cn(
              "text-sm font-medium",
              center.shortageLevel > 7 ? "text-destructive" :
              center.shortageLevel > 4 ? "text-chart-3" : "text-primary"
            )}>
              {center.shortageLevel}/10
            </span>
          </div>
          <Progress 
            value={center.shortageLevel * 10} 
            className={cn(
              center.shortageLevel > 7 && "[&>div]:bg-destructive",
              center.shortageLevel > 4 && center.shortageLevel <= 7 && "[&>div]:bg-chart-3",
              center.shortageLevel <= 4 && "[&>div]:bg-primary"
            )} 
          />
        </div>
        
        {/* Required Resources */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Required Resources</span>
          </div>
          <div className="space-y-2">
            {center.requiredResources.map((req: any) => {
              const item = inventory.find((i: any) => i.id === req.itemId)
              const available = item?.quantity || 0
              const canFulfill = available >= req.quantity
              
              return (
                <div key={req.itemId} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item?.name || 'Unknown'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-mono",
                      canFulfill ? "text-primary" : "text-destructive"
                    )}>
                      {req.quantity} needed
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({available} avail.)
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Incoming Dispatches */}
        {incomingDispatches.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Incoming Dispatches</span>
            </div>
            <div className="space-y-2">
              {incomingDispatches.map((dispatch: any) => (
                <div key={dispatch.id} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Delivery from Warehouse</p>
                    <p className="text-xs text-muted-foreground">
                      Status: <span className="capitalize text-primary">{dispatch.status}</span>
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => updateDispatchStatus(dispatch.id, 'delivered')}
                  >
                    Mark Received
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Priority Score Breakdown */}
        <div className="rounded-lg border bg-muted/50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Priority Score Calculation</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>People Count: {center.peopleCount}</p>
            <p>Shortage Level: {center.shortageLevel}</p>
            <p className="font-medium text-foreground pt-1 border-t">
              Score = {center.peopleCount} × {center.shortageLevel} = {center.priorityScore}
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <EditCenterDialog center={center} />
          <Button asChild className="flex-1">
            <Link href={`/dispatch?center=${center.id}`}>
              <Truck className="h-4 w-4 mr-2" />
              Create Dispatch
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
