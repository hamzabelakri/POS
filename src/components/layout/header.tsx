import { Link, useLocation, useRouter } from '@tanstack/react-router'
import { ArrowLeft, LogOut, Pause, Power } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
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
          <Badge variant='outline' className='gap-2 px-3 py-1' role='status'>
            <span
              className='size-2 rounded-full bg-emerald-500'
              aria-hidden='true'
            />
            {t('system_online')}
          </Badge>
        </div>

        {/* Right: switches + actions */}
        <div className='flex items-center gap-2 justify-self-end pe-4'>
          <LanguageSwitch />
          <ThemeSwitch />

          {isConfigPage ? (
            <Button asChild variant='outline' size='sm'>
              <Link to='/'>
                <ArrowLeft className='rtl:rotate-180' aria-hidden='true' />
                <span>{t('back_to_payment')}</span>
              </Link>
            </Button>
          ) : (
            <>
              <Button
                variant='outline'
                size='sm'
                onClick={() => router.navigate({ to: '/sign-in' })}
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