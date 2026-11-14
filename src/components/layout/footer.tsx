// src/components/layout/footer.tsx
import { useState } from 'react'
import { SlidersHorizontal, Monitor, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth-store'
import { usePosConfigStore } from '@/stores/pos-config-store'
import { ConfigPasswordModal } from '../config-password'

export function Footer() {
  const { t } = useTranslation()
  const [configOpen, setConfigOpen] = useState(false)

  const pos = usePosConfigStore((s) => s.config?.pos)
  const cashier = useAuthStore((s) => s.cashier)

  const cashierName = cashier
    ? `${cashier.first_name} ${cashier.last_name}`.trim()
    : ''
  const initials = cashier
    ? `${cashier.first_name.charAt(0)}${cashier.last_name.charAt(0)}`.toUpperCase()
    : ''

  return (
    <>
      <footer className='mt-auto shrink-0 border-t bg-background px-4 py-2 text-xs text-muted-foreground'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          {/* Left: POS name + cashier */}
          <div className='flex min-w-0 flex-wrap items-center gap-3'>
            {pos?.name && (
              <div className='flex min-w-0 items-center gap-1.5'>
                <Monitor className='size-3.5 shrink-0' aria-hidden='true' />
                <span className='truncate font-medium text-muted-foreground'>
                  {pos.name}
                </span>
              </div>
            )}

            {pos?.name && cashier && (
              <Separator orientation='vertical' className='h-4' />
            )}

            {cashier && (
              <div className='flex min-w-0 items-center gap-1.5'>
                <User className='size-3.5 shrink-0' aria-hidden='true' />
                <span className='truncate font-medium text-muted-foreground'>
                  {cashierName}
                </span>
              </div>
            )}
          </div>

          {/* Right: configuration */}
          <Button
            type='button'
            variant='ghost'
            size='sm'
            className='h-6 gap-1 px-2 text-xs'
            onClick={() => setConfigOpen(true)}
          >
            <SlidersHorizontal className='size-3.5' aria-hidden='true' />
            {t('configurations')}
          </Button>
        </div>
      </footer>

      <ConfigPasswordModal open={configOpen} onOpenChange={setConfigOpen} />
    </>
  )
}