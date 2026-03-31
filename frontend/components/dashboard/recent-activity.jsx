'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/lib/store'
import { Truck, Package, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RecentActivity() {
  const dispatches = useStore(state => state.dispatches)
  
  const recentDispatches = [...dispatches]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': return 'bg-primary/10 text-primary border-primary/20'
      case 'in-transit': return 'bg-chart-2/10 text-chart-2 border-chart-2/20'
      case 'pending': return 'bg-chart-3/10 text-chart-3 border-chart-3/20'
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20'
      default: return 'bg-muted text-muted-foreground'
    }
  }
  
  const formatTimeAgo = (date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ago`
    } else if (hours > 0) {
      return `${hours}h ago`
    } else {
      return `${minutes}m ago`
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest dispatch operations</CardDescription>
      </CardHeader>
      <CardContent>
        {recentDispatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Truck className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">No Activity Yet</p>
            <p className="text-xs text-muted-foreground">Dispatches will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentDispatches.map(dispatch => (
              <div key={dispatch.id} className="flex items-start gap-3 p-2 rounded-xl transition-all duration-300 hover:bg-muted/50 hover:translate-x-1 cursor-pointer group">
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-lg shrink-0',
                  dispatch.status === 'delivered' && 'bg-primary/10',
                  dispatch.status === 'in-transit' && 'bg-chart-2/10',
                  dispatch.status === 'pending' && 'bg-chart-3/10',
                  dispatch.status === 'cancelled' && 'bg-destructive/10'
                )}>
                  {dispatch.status === 'in-transit' ? (
                    <Truck className="h-4 w-4 text-chart-2" />
                  ) : (
                    <Package className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {dispatch.centerName}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(dispatch.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {dispatch.items.map(i => i.itemName).join(', ')}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={cn('text-xs', getStatusColor(dispatch.status))}>
                      {dispatch.status.replace('-', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      via {dispatch.volunteerName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
