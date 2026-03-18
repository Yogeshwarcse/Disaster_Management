'use client'

import { useMemo } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { StatsCard } from '@/components/dashboard/stats-card'
import { InventoryChart } from '@/components/dashboard/inventory-chart'
import { DispatchStatsChart } from '@/components/dashboard/dispatch-stats-chart'
import { DemandSupplyChart } from '@/components/dashboard/demand-supply-chart'
import { CriticalCentersList } from '@/components/dashboard/critical-centers-list'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { useStore } from '@/lib/store'
import { 
  Package, 
  MapPin, 
  Users, 
  Truck, 
  AlertTriangle, 
  TrendingUp,
  Activity,
  Heart
} from 'lucide-react'

export default function DashboardPage() {
  const inventory = useStore(state => state.inventory)
  const centers = useStore(state => state.centers)
  const volunteers = useStore(state => state.volunteers)
  const dispatches = useStore(state => state.dispatches)
  
  const stats = useMemo(() => {
    const totalInventory = inventory.reduce((sum: number, item: any) => sum + item.quantity, 0)
    const lowStockItems = inventory.filter((item: any) => item.quantity <= item.threshold).length
    const criticalCenters = centers.filter((c: any) => c.priorityScore >= 8).length
    const activeDispatches = dispatches.filter((d: any) => d.status === 'in-transit' || d.status === 'pending').length
    const averagePriorityScore = centers.length > 0 
      ? (centers.reduce((sum: number, c: any) => sum + c.priorityScore, 0) / centers.length).toFixed(1)
      : '0'
    const totalPeopleServed = centers.reduce((sum: number, c: any) => sum + c.peopleCount, 0)
    
    return {
      totalInventory,
      lowStockItems,
      totalCenters: centers.length,
      criticalCenters,
      totalVolunteers: volunteers.length,
      activeDispatches,
      averagePriorityScore,
      totalPeopleServed
    }
  }, [inventory, centers, volunteers, dispatches])
  
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-64">
        <AppHeader 
          title="Dashboard" 
          description="Real-time overview of disaster relief operations"
        />
        
        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Inventory"
              value={stats.totalInventory.toLocaleString()}
              description="Total units across all resources"
              icon={Package}
              trend="up"
              trendValue="+12% from last week"
              variant="default"
            />
            <StatsCard
              title="Relief Centers"
              value={stats.totalCenters}
              description={`${stats.criticalCenters} critical`}
              icon={MapPin}
              variant={stats.criticalCenters > 0 ? 'critical' : 'default'}
            />
            <StatsCard
              title="Volunteers"
              value={stats.totalVolunteers}
              description="Registered volunteers"
              icon={Users}
              trend="up"
              trendValue="+3 this week"
              variant="success"
            />
            <StatsCard
              title="Active Dispatches"
              value={stats.activeDispatches}
              description="Currently in progress"
              icon={Truck}
              variant={stats.activeDispatches > 5 ? 'warning' : 'default'}
            />
          </div>
          
          {/* Secondary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Critical Alerts"
              value={stats.criticalCenters}
              description="Centers needing attention"
              icon={AlertTriangle}
              variant={stats.criticalCenters > 0 ? 'critical' : 'success'}
            />
            <StatsCard
              title="Low Stock Items"
              value={stats.lowStockItems}
              description="Below threshold"
              icon={Activity}
              variant={stats.lowStockItems > 0 ? 'warning' : 'success'}
            />
            <StatsCard
              title="Avg Priority Score"
              value={stats.averagePriorityScore}
              description="Across all centers"
              icon={TrendingUp}
            />
            <StatsCard
              title="People Served"
              value={stats.totalPeopleServed.toLocaleString()}
              description="Total beneficiaries"
              icon={Heart}
              variant="success"
            />
          </div>
          
          {/* Charts Row */}
          <div className="grid gap-6 lg:grid-cols-2">
            <InventoryChart />
            <DispatchStatsChart />
          </div>
          
          {/* Demand vs Supply */}
          <div className="grid gap-6 lg:grid-cols-3">
            <DemandSupplyChart />
            <CriticalCentersList />
          </div>
          
          {/* Recent Activity */}
          <div className="grid gap-6 lg:grid-cols-2">
            <RecentActivity />
            
            {/* Quick Actions */}
            <div className="rounded-xl border bg-card/80 backdrop-blur-md p-6 shadow-md ring-1 ring-white/5">
              <h3 className="text-base font-medium text-foreground mb-4">Quick Actions</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href="/dispatch"
                  className="group flex items-center gap-3 rounded-xl border bg-background/50 backdrop-blur-sm p-4 transition-all hover:bg-primary/10 hover:border-primary/50 hover:shadow-md hover:shadow-primary/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                    <Truck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">New Dispatch</p>
                    <p className="text-xs text-muted-foreground">Create a new dispatch</p>
                  </div>
                </a>
                <a
                  href="/inventory"
                  className="group flex items-center gap-3 rounded-xl border bg-background/50 backdrop-blur-sm p-4 transition-all hover:bg-chart-3/10 hover:border-chart-3/50 hover:shadow-md hover:shadow-chart-3/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/20 group-hover:bg-chart-3/30 transition-colors">
                    <Package className="h-5 w-5 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Add Inventory</p>
                    <p className="text-xs text-muted-foreground">Add new resources</p>
                  </div>
                </a>
                <a
                  href="/volunteers"
                  className="group flex items-center gap-3 rounded-xl border bg-background/50 backdrop-blur-sm p-4 transition-all hover:bg-chart-2/10 hover:border-chart-2/50 hover:shadow-md hover:shadow-chart-2/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/20 group-hover:bg-chart-2/30 transition-colors">
                    <Users className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Add Volunteer</p>
                    <p className="text-xs text-muted-foreground">Register a volunteer</p>
                  </div>
                </a>
                <a
                  href="/centers"
                  className="group flex items-center gap-3 rounded-xl border bg-background/50 backdrop-blur-sm p-4 transition-all hover:bg-destructive/10 hover:border-destructive/50 hover:shadow-md hover:shadow-destructive/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/20 group-hover:bg-destructive/30 transition-colors">
                    <MapPin className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">View Map</p>
                    <p className="text-xs text-muted-foreground">See relief centers</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
