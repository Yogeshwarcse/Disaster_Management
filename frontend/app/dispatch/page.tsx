'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useStore } from '@/lib/store'
import { 
  findNearestVolunteer, 
  calculateDistance, 
  PriorityQueue,
  generateRouteGraph,
  dijkstraShortestPath
} from '@/lib/algorithms'
import { WAREHOUSE_LOCATION } from '@/lib/mock-data'
import { 
  Truck, 
  Package, 
  MapPin, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Play,
  Route,
  Zap,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

function DispatchContent() {
  const searchParams = useSearchParams()
  const preselectedCenterId = searchParams.get('center')
  
  const inventory = useStore((state: any) => state.inventory)
  const centers = useStore((state: any) => state.centers)
  const volunteers = useStore((state: any) => state.volunteers)
  const dispatches = useStore((state: any) => state.dispatches)
  const createDispatch = useStore((state: any) => state.createDispatch)
  const updateDispatchStatus = useStore((state: any) => state.updateDispatchStatus)
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState('')
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [showAlgorithmDetails, setShowAlgorithmDetails] = useState(false)
  
  // Auto-dispatch state
  const [autoDispatchResult, setAutoDispatchResult] = useState<any>(null)
  
  // Priority Queue visualization
  const priorityQueue = useMemo(() => new PriorityQueue(centers), [centers])
  const prioritizedCenters = priorityQueue.getAll()
  
  useEffect(() => {
    if (preselectedCenterId) {
      setSelectedCenter(preselectedCenterId)
      setIsCreateDialogOpen(true)
    }
  }, [preselectedCenterId])
  
  const handleCreateDispatch = () => {
    if (!selectedCenter || selectedItems.length === 0) return
    
    const dispatch = createDispatch(selectedCenter, selectedItems)
    if (dispatch) {
      setIsCreateDialogOpen(false)
      setSelectedCenter('')
      setSelectedItems([])
    }
  }
  
  const toggleItem = (itemId: string, maxQuantity: number) => {
    setSelectedItems((prev: any[]) => {
      const existing = prev.find((i: any) => i.itemId === itemId)
      if (existing) {
        return prev.filter((i: any) => i.itemId !== itemId)
      }
      return [...prev, { itemId, quantity: Math.min(100, maxQuantity) }]
    })
  }
  
  const updateItemQuantity = (itemId: string, quantity: number) => {
    setSelectedItems((prev: any[]) => 
      prev.map((i: any) => i.itemId === itemId ? { ...i, quantity } : i)
    )
  }
  
  // Run Smart Auto-Dispatch Algorithm
  const runAutoDispatch = () => {
    const topCenter = priorityQueue.peek()
    if (!topCenter) return
    
    // Get required resources for top priority center
    const allocations: any[] = []
    
    // Greedy allocation for each required resource
    topCenter.requiredResources.forEach((req: any) => {
      const item = inventory.find((i: any) => i.id === req.itemId)
      if (item && item.quantity > 0) {
        const toAllocate = Math.min(req.quantity, item.quantity)
        if (toAllocate > 0) {
          const existingAlloc = allocations.find((a: any) => a.centerId === topCenter.id)
          if (existingAlloc) {
            existingAlloc.items.push({
              itemId: req.itemId,
              itemName: item.name,
              quantity: toAllocate
            })
          } else {
            allocations.push({
              centerId: topCenter.id,
              centerName: topCenter.name,
              items: [{
                itemId: req.itemId,
                itemName: item.name,
                quantity: toAllocate
              }]
            })
          }
        }
      }
    })
    
    // Find nearest volunteer
    const nearestVol = findNearestVolunteer(volunteers, topCenter.location)
    
    // Calculate route distance using Dijkstra
    const { nodes, edges } = generateRouteGraph(WAREHOUSE_LOCATION, centers)
    const { distance } = dijkstraShortestPath(nodes, edges, 'warehouse', topCenter.id)
    
    setAutoDispatchResult({
      allocations,
      volunteer: nearestVol ? {
        id: nearestVol.id,
        name: nearestVol.name,
        distance: calculateDistance(nearestVol.location, topCenter.location)
      } : null,
      routeDistance: distance
    })
  }
  
  const executeAutoDispatch = () => {
    if (!autoDispatchResult || autoDispatchResult.allocations.length === 0) return
    
    const alloc = autoDispatchResult.allocations[0]
    const items = alloc.items.map((i: any) => ({ itemId: i.itemId, quantity: i.quantity }))
    createDispatch(alloc.centerId, items)
    setAutoDispatchResult(null)
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-primary/10 text-primary border-primary/20'
      case 'in-transit': return 'bg-chart-2/10 text-chart-2 border-chart-2/20'
      case 'pending': return 'bg-chart-3/10 text-chart-3 border-chart-3/20'
      case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20'
      default: return 'bg-muted text-muted-foreground'
    }
  }
  
  const stats = {
    total: dispatches.length,
    pending: dispatches.filter((d: any) => d.status === 'pending').length,
    inTransit: dispatches.filter((d: any) => d.status === 'in-transit').length,
    delivered: dispatches.filter((d: any) => d.status === 'delivered').length,
    cancelled: dispatches.filter((d: any) => d.status === 'cancelled').length
  }
  
  const selectedCenterData = centers.find((c: any) => c.id === selectedCenter)
  const availableVolunteer = selectedCenterData 
    ? findNearestVolunteer(volunteers, selectedCenterData.location)
    : null
  
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <AppHeader 
          title="Smart Dispatch System" 
          description="Automated resource allocation and volunteer assignment"
        />
        
        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Dispatches</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-chart-3/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                  <Clock className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-xl font-bold text-chart-3">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-chart-2/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                  <Truck className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-xl font-bold text-chart-2">{stats.inTransit}</p>
                  <p className="text-xs text-muted-foreground">In Transit</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">{stats.delivered}</p>
                  <p className="text-xs text-muted-foreground">Delivered</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xl font-bold text-destructive">{stats.cancelled}</p>
                  <p className="text-xs text-muted-foreground">Cancelled</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Smart Auto-Dispatch Panel */}
            <Card className="lg:col-span-1 border-primary/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Smart Auto-Dispatch
                </CardTitle>
                <CardDescription>
                  Automated resource allocation using Greedy Algorithm + Priority Queue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Priority Queue Visualization */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Priority Queue (Top 5)</p>
                  <div className="space-y-2">
                    {prioritizedCenters.slice(0, 5).map((center: any, index: number) => (
                      <div
                        key={center.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-lg border text-sm",
                          index === 0 && "border-primary bg-primary/5"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground w-4">
                            {index + 1}.
                          </span>
                          <span className={cn(
                            "truncate",
                            index === 0 && "font-medium text-primary"
                          )}>
                            {center.name}
                          </span>
                        </div>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          center.status === 'critical' && "border-destructive text-destructive"
                        )}>
                          {center.priorityScore}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Algorithm Details Toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowAlgorithmDetails(!showAlgorithmDetails)}
                >
                  {showAlgorithmDetails ? 'Hide' : 'Show'} Algorithm Details
                </Button>
                
                {showAlgorithmDetails && (
                  <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-2">
                    <p className="font-medium text-foreground">Algorithms Used:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>1. Priority Queue: Sort centers by priority score</li>
                      <li>2. Greedy: Allocate to highest priority first</li>
                      <li>3. Nearest Neighbor: Find closest volunteer</li>
                      <li>4. Dijkstra: Calculate optimal route</li>
                    </ul>
                  </div>
                )}
                
                {/* Run Auto-Dispatch */}
                <Button
                  className="w-full"
                  onClick={runAutoDispatch}
                  disabled={prioritizedCenters.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Auto-Dispatch Analysis
                </Button>
                
                {/* Auto-Dispatch Result */}
                {autoDispatchResult && (
                  <div className="space-y-3 pt-4 border-t">
                    <p className="text-sm font-medium text-primary">Analysis Result:</p>
                    
                    {autoDispatchResult.allocations.map((alloc: any) => (
                      <div key={alloc.centerId} className="rounded-lg border bg-primary/5 p-3 space-y-2">
                        <p className="text-sm font-medium">{alloc.centerName}</p>
                        <div className="space-y-1">
                          {alloc.items.map((item: any) => (
                            <div key={item.itemId} className="flex justify-between text-xs">
                              <span className="text-muted-foreground">{item.itemName}</span>
                              <span className="font-mono">{item.quantity} units</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {autoDispatchResult.volunteer && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Nearest Volunteer:</span>
                        <span className="font-medium">{autoDispatchResult.volunteer.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Route Distance:</span>
                      <span className="font-mono">{autoDispatchResult.routeDistance?.toFixed(1) || '0.0'} km</span>
                    </div>
                    
                    <Button
                      className="w-full"
                      onClick={executeAutoDispatch}
                      disabled={!autoDispatchResult.volunteer}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Execute Dispatch
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Manual Dispatch + Dispatch List */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base">Dispatch History</CardTitle>
                  <CardDescription>Recent dispatch operations and status</CardDescription>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Truck className="h-4 w-4 mr-2" />
                  Manual Dispatch
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dispatches.length === 0 ? (
                    <div className="text-center py-8">
                      <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm font-medium text-foreground">No Dispatches Yet</p>
                      <p className="text-xs text-muted-foreground">Create a dispatch to get started</p>
                    </div>
                  ) : (
                    [...dispatches]
                      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                      .map((dispatch: any) => (
                        <div
                          key={dispatch.id}
                          className="flex items-start gap-4 p-4 rounded-lg border"
                        >
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                            dispatch.status === 'delivered' && "bg-primary/10",
                            dispatch.status === 'in-transit' && "bg-chart-2/10",
                            dispatch.status === 'pending' && "bg-chart-3/10",
                            dispatch.status === 'cancelled' && "bg-destructive/10"
                          )}>
                            <Truck className={cn(
                              "h-5 w-5",
                              dispatch.status === 'delivered' && "text-primary",
                              dispatch.status === 'in-transit' && "text-chart-2",
                              dispatch.status === 'pending' && "text-chart-3",
                              dispatch.status === 'cancelled' && "text-destructive"
                            )} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-foreground">{dispatch.centerName}</h3>
                              <Badge variant="outline" className={getStatusColor(dispatch.status)}>
                                {dispatch.status.replace('-', ' ')}
                              </Badge>
                            </div>
                            
                            <div className="mt-2 grid gap-2 sm:grid-cols-2 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {dispatch.items.map((i: any) => i.itemName).join(', ')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {dispatch.volunteerName}
                              </div>
                              <div className="flex items-center gap-1">
                                <Route className="h-3 w-3" />
                                {dispatch.routeDistance.toFixed(1)} km
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(dispatch.timestamp).toLocaleString()}
                              </div>
                            </div>
                            
                            {/* Status Actions */}
                            {(dispatch.status === 'pending' || dispatch.status === 'in-transit') && (
                              <div className="mt-3 flex gap-2">
                                {dispatch.status === 'pending' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateDispatchStatus(dispatch.id, 'in-transit')}
                                  >
                                    <ArrowRight className="h-3 w-3 mr-1" />
                                    Start Transit
                                  </Button>
                                )}
                                {dispatch.status === 'in-transit' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateDispatchStatus(dispatch.id, 'delivered')}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Mark Delivered
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => updateDispatchStatus(dispatch.id, 'cancelled')}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Manual Dispatch Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Manual Dispatch</DialogTitle>
              <DialogDescription>
                Select a relief center and resources to dispatch.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Center Selection */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">Relief Center</label>
                <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a center" />
                  </SelectTrigger>
                  <SelectContent>
                    {centers.map((center: any) => (
                      <SelectItem key={center.id} value={center.id}>
                        <div className="flex items-center gap-2">
                          <span>{center.name}</span>
                          <Badge variant="outline" className={cn(
                            "text-xs",
                            center.status === 'critical' && "border-destructive text-destructive"
                          )}>
                            {center.priorityScore}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Selected Center Info */}
              {selectedCenterData && (
                <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">People:</span>
                    <span className="font-medium">{selectedCenterData.peopleCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shortage Level:</span>
                    <span className="font-medium">{selectedCenterData.shortageLevel}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assigned Volunteer:</span>
                    <span className="font-medium">{availableVolunteer?.name || 'None available'}</span>
                  </div>
                </div>
              )}
              
              {/* Resource Selection */}
              <div className="grid gap-2">
                <label className="text-sm font-medium">Resources to Dispatch</label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {inventory.filter((item: any) => item.quantity > 0).map((item: any) => {
                    const isSelected = selectedItems.some((i: any) => i.itemId === item.id)
                    const selectedItem = selectedItems.find((i: any) => i.itemId === item.id)
                    return (
                      <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg border">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleItem(item.id, item.quantity)}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Available: {item.quantity} {item.unit}
                          </p>
                        </div>
                        {isSelected && (
                          <Input
                            type="number"
                            className="w-20"
                            value={selectedItem?.quantity || 0}
                            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                            min={1}
                            max={item.quantity}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateDispatch}
                disabled={!selectedCenter || selectedItems.length === 0 || !availableVolunteer}
              >
                <Truck className="h-4 w-4 mr-2" />
                Create Dispatch
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

export default function DispatchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading dispatch system...</div>}>
      <DispatchContent />
    </Suspense>
  )
}
