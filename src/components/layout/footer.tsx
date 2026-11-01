import { useEffect, useState } from 'react'
import { SlidersHorizontal, Terminal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
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

// TODO: replace with real data (auth store / POS config / connection status)
const pos = { number: 1, code: 'POS_001' }
const user = { name: 'zied zied' }
const isConnected = true

export function Footer() {
  const { t } = useTranslation()
  const [configOpen, setConfigOpen] = useState(false)
  const now = useNow()

  return (
    <>
      <footer className='mt-auto shrink-0 border-t bg-background px-4 py-2 text-xs text-muted-foreground'>
        <div className='flex flex-wrap items-center justify-between gap-4'>
          {/* LEFT: POS / user / connection */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-1.5'>
              <Terminal className='size-3.5' aria-hidden='true' />
              <span>{t('pos', 'POS')}</span>
              <span className='font-semibold text-foreground'>
                {pos.number}
              </span>
            </div>

            <Separator orientation='vertical' className='h-4' />

            <span>{pos.code}</span>

            <div className='flex items-center gap-1.5'>
              <Avatar className='size-5'>
                <AvatarFallback className='text-[10px]'>
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className='text-foreground'>{user.name}</span>
            </div>

            <Badge variant='outline' className='gap-1.5'>
              <span
                className={`size-1.5 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
                aria-hidden='true'
              />
              {isConnected
                ? t('connected', 'Connected')
                : t('disconnected', 'Disconnected')}
            </Badge>
          </div>

          {/* RIGHT: live clock + configurations */}
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
              {t('configurations', 'Configurations')}
            </Button>
          </div>
        </div>
      </footer>

      <ConfigPasswordModal open={configOpen} onOpenChange={setConfigOpen} />
    </>
  )
}