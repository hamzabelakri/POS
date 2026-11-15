import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface SidebarNavItem {
  value: string
  title: string
  icon: ReactNode
  group: string
  badge?: number
}

interface SidebarNavProps {
  items: SidebarNavItem[]
  value: string
  onValueChange: (value: string) => void
  className?: string
}

function groupItems(items: SidebarNavItem[]) {
  const map = new Map<string, SidebarNavItem[]>()
  for (const item of items) {
    map.set(item.group, [...(map.get(item.group) ?? []), item])
  }
  return [...map.entries()]
}

export function SidebarNav({
  items,
  value,
  onValueChange,
  className,
}: SidebarNavProps) {
  const { t } = useTranslation()
  const groups = groupItems(items)

  return (
    <>
      {/* Mobile: grouped dropdown */}
      <div className='md:hidden'>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className='w-full'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {groups.map(([group, list]) => (
              <SelectGroup key={group}>
                <SelectLabel>{group}</SelectLabel>
                {list.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    <span className='flex items-center gap-2'>
                      {item.icon}
                      {item.title}
                    </span>
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Desktop: sticky grouped list */}
      <nav
        className={cn('sticky top-4 hidden w-60 shrink-0 self-start md:block', className)}
        aria-label={t('configuration_sections')}
      >
        <div className='bg-card space-y-3 rounded-xl border p-2'>
          {groups.map(([group, list]) => (
            <div key={group} className='space-y-0.5'>
              <p className='text-muted-foreground px-3 pt-2 pb-1 text-xs font-medium'>
                {group}
              </p>
              {list.map((item) => {
                const active = item.value === value
                return (
                  <button
                    key={item.value}
                    type='button'
                    onClick={() => onValueChange(item.value)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'focus-visible:ring-ring relative flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-start text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
                      'hover:bg-accent hover:text-accent-foreground',
                      active
                        ? "bg-accent text-foreground before:bg-primary before:absolute before:inset-y-2 before:start-0 before:w-0.5 before:rounded-full before:content-['']"
                        : 'text-muted-foreground'
                    )}
                  >
                    <span className={active ? 'text-primary' : undefined}>
                      {item.icon}
                    </span>
                    <span className='flex-1 truncate'>{item.title}</span>
                    {item.badge !== undefined && (
                      <span className='text-muted-foreground text-xs tabular-nums'>
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </nav>
    </>
  )
}