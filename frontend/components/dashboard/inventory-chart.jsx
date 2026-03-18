'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { useStore } from '@/lib/store'

export function InventoryChart() {
  const inventory = useStore(state => state.inventory)
  
  const data = inventory.map(item => ({
    name: item.name.split(' ')[0],
    quantity: item.quantity,
    threshold: item.threshold,
    isLow: item.quantity <= item.threshold
  }))
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Inventory Levels</CardTitle>
        <CardDescription>Current stock quantities by resource type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis 
                type="number" 
                stroke="var(--muted-foreground)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="var(--muted-foreground)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={80}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-popover p-3 shadow-md">
                        <p className="text-sm font-medium text-foreground">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: <span className="font-medium text-foreground">{data.quantity}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Threshold: <span className="font-medium text-foreground">{data.threshold}</span>
                        </p>
                        {data.isLow && (
                          <p className="text-xs text-destructive font-medium mt-1">Low Stock Alert</p>
                        )}
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="quantity" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.isLow ? 'var(--chart-4)' : 'var(--chart-1)'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
