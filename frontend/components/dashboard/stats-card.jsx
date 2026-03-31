'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  variant = 'default'
}) {
  return (
    <Card className={cn(
      'relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-xl cursor-default',
      variant === 'default' && 'bg-card/40 backdrop-blur-sm hover:border-primary/30 hover:shadow-primary/10',
      variant === 'critical' && 'border-destructive/50 bg-destructive/5 hover:border-destructive/80 hover:shadow-destructive/20',
      variant === 'warning' && 'border-chart-3/50 bg-chart-3/5 hover:border-chart-3/80 hover:shadow-chart-3/20',
      variant === 'success' && 'border-primary/50 bg-primary/5 hover:border-primary/80 hover:shadow-primary/20'
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && trendValue && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend === 'up' && 'text-primary',
                trend === 'down' && 'text-destructive',
                trend === 'neutral' && 'text-muted-foreground'
              )}>
                {trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {trend === 'down' && <TrendingDown className="h-3 w-3" />}
                {trend === 'neutral' && <Minus className="h-3 w-3" />}
                {trendValue}
              </div>
            )}
          </div>
          <div className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            variant === 'default' && 'bg-primary/10 text-primary',
            variant === 'critical' && 'bg-destructive/10 text-destructive',
            variant === 'warning' && 'bg-chart-3/10 text-chart-3',
            variant === 'success' && 'bg-primary/10 text-primary'
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
