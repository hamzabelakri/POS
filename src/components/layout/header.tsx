import { useEffect, useState, useSyncExternalStore } from 'react'
import { Link, useLocation, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Clock, CreditCard, Pause, Power } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/hooks/use-auth'
import { AlertEnum } from '@/models/alert-model'
import { useAlertStore } from '@/stores/alert-store'
import { useAuthStore } from '@/stores/auth-store'
import { LanguageSwitch } from '../language-switch'
import { ThemeSwitch } from '../theme-switch'

type HeaderProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

const navItems = [
  { to: '/', label: 'payment', icon: CreditCard },
  { to: '/shift-report', label: 'shift', icon: Clock },
] as const

// Must be a stable reference for useSyncExternalStore, so it lives at module level.
function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

export function Header({ className, fixed, ...props }: HeaderProps) {
  const { t } = useTranslation()
  const router = useRouter()

  // Scroll state: only re-render when crossing the threshold, not on every scroll event.
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => {
      const top = document.body.scrollTop || document.documentElement.scrollTop
      setScrolled(top > 10)
    }
    onScroll()
    document.addEventListener('scroll', onScroll, { passive: true })
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  const isConfigPage = useLocation({
    select: (location) => location.pathname.startsWith('/config'),
  })

  // Connectivity
  const online = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  )

  // Shift actions
  const shift = useAuthStore((state) => state.shift)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const showAlert = useAlertStore((state) => state.showAlert)
  const { mutate: logoutShift, isPending } = useLogout()

  // Pause: drop the local session and go to login. The shift stays open on the
  // server, so signing in again reports has_open_shift = true.
  const handlePause = () => {
    clearAuth()
    router.navigate({ to: '/sign-in' })
  }

  // Close: POST /auth/logout { shift_id }. The hook then clears the session and
  // navigates to /sign-in. It needs the id of the open shift.
  const handleClose = () => {
    if (!shift) {
      showAlert({
        type: AlertEnum.ERROR,
        message: t('shift_unavailable', 'Shift details unavailable'),
        description: t(
          'shift_unavailable_hint',
          'The shift id is missing, so the shift cannot be closed from here.'
        ),
      })
      return
    }

    logoutShift({ shift_id: shift.id })
  }

  const showBlur = scrolled && fixed

  return (
    <header
      className={cn(
        'z-50 h-(--header-height)',
        fixed && 'header-fixed peer/header sticky top-0 w-full',
        showBlur ? 'shadow' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative grid h-full grid-cols-[1fr_auto_1fr] items-center gap-4 p-4',
          showBlur &&
            'after:bg-background/20 after:absolute after:inset-0 after:-z-10 after:backdrop-blur-lg'
        )}
      >
        {/* Logo + navigation */}
        <div className='flex items-center gap-4 justify-self-start'>
          <Link to='/' className='flex items-center'>
            <img src='/images/logo.svg' alt={t('app_name')} className='h-8 w-auto' />
          </Link>

          {!isConfigPage && (
            <nav className='flex items-center gap-1' aria-label={t('main_navigation')}>
              {navItems.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: to === '/' }}
                  className='inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground data-[status=active]:bg-accent data-[status=active]:text-accent-foreground'
                >
                  <Icon className='size-4' aria-hidden='true' />
                  <span className='max-sm:sr-only'>{t(label)}</span>
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* System status */}
        <Badge variant='outline' className='gap-2 px-3 py-1' role='status'>
          <span
            className={cn(
              'size-2 rounded-full',
              online ? 'bg-emerald-500' : 'bg-destructive'
            )}
            aria-hidden='true'
          />
          {online ? t('system_online') : t('system_offline')}
        </Badge>

        {/* Switches + actions */}
        <div className='flex items-center gap-2 justify-self-end'>
          <LanguageSwitch />
          <ThemeSwitch />

          {isConfigPage ? (
            <Button asChild variant='outline' size='sm'>
              <Link to='/'>
                <ArrowLeft className='rtl:rotate-180' aria-hidden='true' />
                <span>{t('back_to_payment', 'Back to payment')}</span>
              </Link>
            </Button>
          ) : (
            <>
              <Button variant='outline' size='sm' onClick={handlePause} disabled={isPending}>
                <Pause aria-hidden='true' />
                <span className='max-lg:sr-only'>{t('pause_shift')}</span>
              </Button>

              <Button
                variant='destructive'
                size='sm'
                onClick={handleClose}
                disabled={isPending}
              >
                <Power aria-hidden='true' />
                <span className='max-lg:sr-only'>{t('close_shift')}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}