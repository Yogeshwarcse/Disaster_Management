'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { useStore } from '@/lib/store'

export function DispatchStatsChart() {
  const dispatches = useStore(state => state.dispatches)
  
  const statusCounts = dispatches.reduce((acc, dispatch) => {
    acc[dispatch.status] = (acc[dispatch.status] || 0) + 1
    return acc
  }, {})
  
  const data = [
    { name: 'Delivered', value: statusCounts['delivered'] || 0, fill: 'var(--chart-1)' },
    { name: 'In Transit', value: statusCounts['in-transit'] || 0, fill: 'var(--chart-2)' },
    { name: 'Pending', value: statusCounts['pending'] || 0, fill: 'var(--chart-3)' },
    { name: 'Cancelled', value: statusCounts['cancelled'] || 0, fill: 'var(--chart-4)' },
  ].filter(item => item.value > 0)
  
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Dispatch Statistics</CardTitle>
        <CardDescription>Distribution of dispatch statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {total === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No dispatch data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-popover p-3 shadow-md">
                          <p className="text-sm font-medium text-foreground">{data.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Count: <span className="font-medium text-foreground">{data.value}</span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Percentage: <span className="font-medium text-foreground">
                              {((data.value / total) * 100).toFixed(1)}%
                            </span>
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => (
                    <span className="text-sm text-muted-foreground">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
