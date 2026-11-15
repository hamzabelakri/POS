// src/apps/payment/components/panel-header.tsx
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { CardHeader } from '@/components/ui/card'

export function PanelHeader({
  className,
  ...props
}: ComponentProps<typeof CardHeader>) {
  return (
    <CardHeader
      className={cn(
        'bg-muted/50 rounded-t-xl border-b py-2.5 [.border-b]:pb-2.5',
        className
      )}
      {...props}
    />
  )
}