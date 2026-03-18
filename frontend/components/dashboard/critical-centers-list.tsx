'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { AlertTriangle, MapPin, Users, ArrowRight } from 'lucide-react'

export function CriticalCentersList() {
  const centers = useStore(state => state.centers)
  
  const criticalCenters = centers
    .filter(c => c.status === 'critical')
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 5)
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Critical Centers
          </CardTitle>
          <CardDescription>Centers requiring immediate attention</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/centers" className="flex items-center gap-1">
            View All
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {criticalCenters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-primary/10 p-3 mb-3">
              <AlertTriangle className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">All Clear</p>
            <p className="text-xs text-muted-foreground">No critical centers at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {criticalCenters.map(center => (
              <div
                key={center.id}
                className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{center.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {center.peopleCount} people
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {center.location.lat.toFixed(2)}, {center.location.lng.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    Score: {center.priorityScore}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
