'use client'

import { useState, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CenterDetailsPanel } from '@/components/centers/center-details-panel'
import { useStore } from '@/lib/store'
import { 
  Search, 
  MapPin, 
  Users, 
  AlertTriangle,
  ArrowUpDown,
  Layers,
  List,
  Map as MapIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Dynamic import for map to avoid SSR issues
const ReliefCenterMap = dynamic(
  () => import('@/components/centers/relief-center-map').then(mod => mod.ReliefCenterMap),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    )
  }
)

const AddCenterDialog = dynamic(
  () => import('@/components/centers/add-center-dialog').then(mod => mod.AddCenterDialog),
  { ssr: false }
)

export default function CentersPage() {
  const centers = useStore(state => state.centers)
  const init = useStore(state => state.init)
  
  useEffect(() => {
    init()
  }, [])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('priority')
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [viewMode, setViewMode] = useState('map')
  const [showHeatmap, setShowHeatmap] = useState(true)
  
  const filteredAndSortedCenters = useMemo(() => {
    return centers
      .filter((center) => {
        const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || center.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'priority': return b.priorityScore - a.priorityScore
          case 'people': return b.peopleCount - a.peopleCount
          case 'shortage': return b.shortageLevel - a.shortageLevel
          case 'name': return a.name.localeCompare(b.name)
          default: return 0
        }
      })
  }, [centers, searchTerm, statusFilter, sortBy])
  
  const selectedCenterData = centers.find((c) => c.id === selectedCenter)
  
  const stats = {
    total: centers.length,
    critical: centers.filter((c) => c.status === 'critical').length,
    active: centers.filter((c) => c.status === 'active').length,
    stable: centers.filter((c) => c.status === 'stable').length,
    totalPeople: centers.reduce((sum, c) => sum + c.peopleCount, 0)
  }
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'active': return 'bg-chart-3/10 text-chart-3 border-chart-3/20'
      case 'stable': return 'bg-primary/10 text-primary border-primary/20'
      default: return 'bg-muted text-muted-foreground'
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <AppHeader 
          title="Relief Centers" 
          description="Monitor and manage relief center locations and status"
        />
        
        <div className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Centers</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-destructive/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xl font-bold text-destructive">{stats.critical}</p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
                  <MapPin className="h-5 w-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stats.active}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stats.stable}</p>
                  <p className="text-xs text-muted-foreground">Stable</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                  <Users className="h-5 w-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{stats.totalPeople.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">People</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search centers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="stable">Stable</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority Score</SelectItem>
                <SelectItem value="people">People Count</SelectItem>
                <SelectItem value="shortage">Shortage Level</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Heatmap</span>
              <Switch checked={showHeatmap} onCheckedChange={setShowHeatmap} />
            </div>
            <div className="flex rounded-lg border">
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode('map')}
              >
                <MapIcon className="h-4 w-4 mr-1" />
                Map
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-1" />
                List
              </Button>
            </div>
            <div className="ml-auto flex items-center">
              <AddCenterDialog />
            </div>
          </div>
          
          {/* Heatmap Legend */}
          {showHeatmap && viewMode === 'map' && (
            <Card className="p-4">
              <div className="flex items-center gap-6">
                <span className="text-sm font-medium text-foreground">Priority Heatmap:</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#22c55e]" />
                    <span className="text-xs text-muted-foreground">Low</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#eab308]" />
                    <span className="text-xs text-muted-foreground">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#f97316]" />
                    <span className="text-xs text-muted-foreground">High</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-[#ef4444]" />
                    <span className="text-xs text-muted-foreground">Critical</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground ml-4">
                  Circle size represents people count
                </span>
              </div>
            </Card>
          )}
          
          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Map / List View */}
            <div className={cn(
              "lg:col-span-2",
              selectedCenterData && "lg:col-span-2"
            )}>
              {viewMode === 'map' ? (
                <Card className="h-[600px]">
                  <CardContent className="p-0 h-full">
                    <ReliefCenterMap
                      centers={filteredAndSortedCenters}
                      selectedCenter={selectedCenter}
                      onCenterSelect={setSelectedCenter}
                      showHeatmap={showHeatmap}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Relief Centers</CardTitle>
                    <CardDescription>{filteredAndSortedCenters.length} centers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredAndSortedCenters.map((center) => (
                        <div
                          key={center.id}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors hover:bg-accent",
                            selectedCenter === center.id && "border-primary bg-primary/5"
                          )}
                          onClick={() => setSelectedCenter(center.id)}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{center.name}</span>
                              <Badge variant="outline" className={getStatusColor(center.status)}>
                                {center.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {center.peopleCount}/{center.capacity}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {center.location.lat.toFixed(2)}, {center.location.lng.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-foreground">{center.priorityScore}</p>
                            <p className="text-xs text-muted-foreground">Priority</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Details Panel */}
            <div className="lg:col-span-1">
              {selectedCenterData ? (
                <CenterDetailsPanel
                  center={selectedCenterData}
                  onClose={() => setSelectedCenter(null)}
                />
              ) : (
                <Card className="h-[600px] flex items-center justify-center">
                  <div className="text-center p-6">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm font-medium text-foreground">No Center Selected</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Click on a center to view details
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
