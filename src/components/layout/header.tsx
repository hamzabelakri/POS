import { Link, useLocation, useRouter } from '@tanstack/react-router'
import { AlertEnum } from '@/models/alert-model'
import { ArrowLeft, LogOut, Pause, Power } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAlertStore } from '@/stores/alert-store'
import { useAuthStore } from '@/stores/auth-store'
import { useSSEStore } from '@/stores/sse-store'
import { cn } from '@/lib/utils'
import { useLogout } from '@/hooks/use-auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LanguageSwitch } from '../language-switch'
import { ThemeSwitch } from '../theme-switch'

type HeaderProps = Omit<React.HTMLAttributes<HTMLElement>, 'children'> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

const navItems = [
  { to: '/', label: 'payment' },
  { to: '/shift-report', label: 'shift_report' },
] as const

export function Header({ className, fixed, ...props }: HeaderProps) {
  const { t } = useTranslation()
  const router = useRouter()

  const isConfigPage = useLocation({
    select: (location) => location.pathname.startsWith('/config'),
  })

  // Shift actions
  const shift = useAuthStore((state) => state.shift)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const showAlert = useAlertStore((state) => state.showAlert)
  const { mutate: logoutShift, isPending } = useLogout()
  const isOnline = useSSEStore((s) => s.natsOnline === true)
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
        message: t('shift_unavailable'),
        description: t('shift_unavailable_hint'),
      })
      return
    }

    logoutShift({ shift_id: shift.id })
  }

  return (
    <header
      className={cn(
        'bg-background z-50 h-13 w-full shrink-0 border-b',
        fixed && 'header-fixed peer/header sticky top-0',
        className
      )}
      {...props}
    >
      <div className='grid h-full grid-cols-[1fr_auto_1fr] items-stretch'>
        {/* Left: logo + navigation */}
        <div className='flex h-full items-center gap-4 justify-self-start ps-4'>
          <div className='flex items-center'>
            <img
              src='/images/logo.svg'
              alt={t('app_name')}
              className='h-7 w-auto max-w-[96px] object-contain'
            />
          </div>

          {!isConfigPage && (
            <nav
              className='flex h-full items-stretch gap-1'
              aria-label={t('main_navigation')}
            >
              {navItems.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  activeOptions={{ exact: to === '/' }}
                  className={cn(
                    'relative inline-flex h-full items-center px-3 text-sm font-medium',
                    'text-muted-foreground hover:text-foreground transition-colors',
                    'data-[status=active]:text-foreground',
                    // underline indicator
                    'after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full',
                    'after:bg-primary after:opacity-0 after:transition-opacity',
                    'data-[status=active]:after:opacity-100'
                  )}
                >
                  {t(label)}
                </Link>
              ))}
            </nav>
          )}
        </div>

        {/* Center: system status — centered relative to the header */}
        <div className='flex items-center justify-center'>
          <Badge
            variant={isOnline ? 'success' : 'destructive'}
            className='gap-2 px-3 py-1'
            role='status'
          >
            <span
              className={cn(
                'size-2 rounded-full',
                isOnline ? 'bg-emerald-500' : 'bg-red-500'
              )}
              aria-hidden='true'
            />
            {isOnline ? t('system_online') : t('system_offline')}
          </Badge>
        </div>

        {/* Right: switches + actions */}
        <div className='flex items-center gap-2 justify-self-end pe-4'>
          <LanguageSwitch />
          <ThemeSwitch />

          {isConfigPage ? (
            <Button
              asChild
              size='sm'
              className='bg-panel hover:bg-panel/90 dark:border-border border border-transparent text-white hover:text-white'
            >
              <Link to='/'>
                <ArrowLeft className='text-red-400 rtl:rotate-180' aria-hidden='true' />
                <span>{t('back')}</span>
              </Link>
            </Button>
          ) : (
            <>
              <Button
                variant='outline'
                size='sm'
                onClick={handlePause}
                disabled={isPending}
              >
                <Pause
                  className='text-red-600 dark:text-red-400'
                  aria-hidden='true'
                />
                <span className='max-lg:sr-only'>{t('pause_shift')}</span>
              </Button>

              <Button
                size='sm'
                className='bg-panel hover:bg-panel/90 dark:border-border border border-transparent text-white hover:text-white'
                onClick={handleClose}
                disabled={isPending}
              >
                <LogOut
                  className='text-red-400 rtl:rotate-180'
                  aria-hidden='true'
                />
                <span className='max-lg:sr-only'>{t('close_shift')}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}