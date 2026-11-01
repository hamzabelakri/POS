import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface SidebarNavItem {
  value: string
  title: string
  icon: ReactNode
}

interface SidebarNavProps {
  items: SidebarNavItem[]
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function SidebarNav({
  items,
  value,
  onValueChange,
  className,
}: SidebarNavProps) {
  return (
    <>
      {/* Mobile: dropdown */}
      <div className='md:hidden'>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                <span className='flex items-center gap-2'>
                  {item.icon}
                  {item.title}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: vertical list */}
      <nav
        className={cn('hidden w-56 shrink-0 flex-col gap-1 md:flex', className)}
        aria-label='Configuration sections'
      >
        {items.map((item) => {
          const active = item.value === value
          return (
            <button
              key={item.value}
              type='button'
              onClick={() => onValueChange(item.value)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                active
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {item.icon}
              {item.title}
            </button>
          )
        })}
      </nav>
    </>
  )
}