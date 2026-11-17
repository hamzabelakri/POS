// src/components/layout/footer.tsx
import { useEffect, useState } from 'react'
import { SlidersHorizontal, Monitor, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth-store'
import { usePosConfigStore } from '@/stores/pos-config-store'
import { ConfigPasswordModal } from '../config-password'

const pad = (n: number) => String(n).padStart(2, '0')

// dd/MM/yyyy HH:mm:ss
function formatDateTime(d: Date) {
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  return `${date} ${time}`
}

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function Footer() {
  const { t } = useTranslation()
  const [configOpen, setConfigOpen] = useState(false)
  const now = useNow()

  const pos = usePosConfigStore((s) => s.config?.pos)
  const cashier = useAuthStore((s) => s.cashier)

  const cashierName = cashier
    ? `${cashier.first_name} ${cashier.last_name}`.trim()
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

          {/* Right: live clock + configurations */}
          <div className='flex items-center gap-4'>
            <time className='tabular-nums' dateTime={now.toISOString()}>
              {formatDateTime(now)}
            </time>
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
        </div>
      </footer>

      <ConfigPasswordModal open={configOpen} onOpenChange={setConfigOpen} />
    </>
  )
}