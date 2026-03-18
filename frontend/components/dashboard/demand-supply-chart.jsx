'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useStore } from '@/lib/store'

export function DemandSupplyChart() {
  const inventory = useStore(state => state.inventory)
  const centers = useStore(state => state.centers)
  
  const data = inventory.slice(0, 6).map(item => {
    const totalDemand = centers.reduce((sum, center) => {
      const req = center.requiredResources.find(r => r.itemId === item.id)
      return sum + (req?.quantity || 0)
    }, 0)
    
    return {
      name: item.name.split(' ')[0],
      supply: item.quantity,
      demand: totalDemand
    }
  })
  
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="text-base font-medium">Demand vs Supply</CardTitle>
        <CardDescription>Comparison of available resources against total demand</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="var(--muted-foreground)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const supply = payload.find(p => p.dataKey === 'supply')?.value || 0
                    const demand = payload.find(p => p.dataKey === 'demand')?.value || 0
                    const surplus = Number(supply) - Number(demand)
                    
                    return (
                      <div className="rounded-lg border bg-popover p-3 shadow-md">
                        <p className="text-sm font-medium text-foreground">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          Supply: <span className="font-medium text-chart-1">{supply}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Demand: <span className="font-medium text-chart-4">{demand}</span>
                        </p>
                        <p className={`text-sm font-medium mt-1 ${surplus >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          {surplus >= 0 ? `Surplus: +${surplus}` : `Shortage: ${surplus}`}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend 
                verticalAlign="top"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground capitalize">{value}</span>
                )}
              />
              <Bar dataKey="supply" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="demand" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
