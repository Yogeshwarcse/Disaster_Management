'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useStore } from '@/lib/store'
import {
  LayoutDashboard,
  Package,
  MapPin,
  Users,
  Truck,
  AlertTriangle,
  Bell,
  Activity
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/centers', label: 'Relief Centers', icon: MapPin },
  { href: '/volunteers', label: 'Volunteers', icon: Users },
  { href: '/dispatch', label: 'Dispatch', icon: Truck },
]

export function AppSidebar() {
  const pathname = usePathname()
  const inventory = useStore((state) => state.inventory)
  const centers = useStore((state) => state.centers)
  const dispatches = useStore((state) => state.dispatches)
  const notifications = useStore((state) => state.notifications)
  
  const stats = useMemo(() => {
    const lowStockItems = inventory.filter((item) => item.quantity <= item.threshold).length
    const criticalCenters = centers.filter((c) => c.status === 'critical').length
    const activeDispatches = dispatches.filter((d) => d.status === 'in-transit' || d.status === 'pending').length
    const totalPeopleServed = centers.reduce((sum, c) => sum + c.peopleCount, 0)
    
    return { lowStockItems, criticalCenters, activeDispatches, totalPeopleServed }
  }, [inventory, centers, dispatches])
  
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar/95 backdrop-blur-md border-r border-sidebar-border shadow-lg">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">DisasterRelief</span>
            <span className="text-xs text-muted-foreground">Management System</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary shadow-sm ring-1 ring-primary/20'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.href === '/centers' && stats.criticalCenters > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
                    {stats.criticalCenters}
                  </span>
                )}
                {item.href === '/inventory' && stats.lowStockItems > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-chart-3 px-1.5 text-xs font-medium text-background">
                    {stats.lowStockItems}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        
        {/* Quick Stats */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-sidebar-accent p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-sidebar-foreground">
              <AlertTriangle className="h-4 w-4 text-chart-3" />
              System Status
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Active Dispatches</span>
                <span className="font-medium text-sidebar-foreground">{stats.activeDispatches}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Critical Centers</span>
                <span className="font-medium text-destructive">{stats.criticalCenters}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">People Served</span>
                <span className="font-medium text-primary">{stats.totalPeopleServed.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notifications */}
        <div className="border-t border-sidebar-border p-4">
          <Link
            href="#"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-sidebar-foreground transition-colors"
          >
            <Bell className="h-4 w-4" />
            Notifications
            {notifications.length > 0 && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-medium text-primary-foreground">
                {notifications.length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </aside>
  )
}
