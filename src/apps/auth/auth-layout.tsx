import type { ReactNode } from 'react'
import { Store } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Bundled with the app at public/images/background.jpg.
// BASE_URL keeps the path correct under a sub-path or a relative-base (Electron/file://) build,
// and the leading base makes it independent of the current route's depth.
const BACKGROUND_URL = `${import.meta.env.BASE_URL}images/background.jpg`

interface AuthLayoutProps {
  children: ReactNode
}

// Split-screen shell shared by every pre-app page (setup, sign-in, start shift).
// It owns the left panel only; each page renders its own right-hand column.
export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()
  const appName = t('app_name')

  return (
    <div className='grid min-h-svh w-full lg:grid-cols-2'>
      <aside
        className='relative hidden bg-cover bg-center bg-no-repeat lg:block dark:border-r'
        style={{ backgroundImage: `url('${BACKGROUND_URL}')` }}
      >
        <div aria-hidden className='absolute inset-0 bg-black/40' />

        <div className='relative flex h-full flex-col justify-between p-10 text-white'>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur'>
              <Store className='h-4 w-4' />
            </div>
            <span className='text-sm font-semibold tracking-tight'>{appName}</span>
          </div>

          <div className='max-w-sm space-y-3'>
            <h2 className='text-2xl font-semibold tracking-tight'>{t('auth_banner_title')}</h2>
            <p className='text-sm leading-relaxed text-white/70'>{t('auth_banner_description')}</p>
          </div>

          <p className='text-xs text-white/40'>
            © {new Date().getFullYear()} {appName}. {t('all_rights_reserved')}
          </p>
        </div>
      </aside>

      <div className='bg-background flex min-h-svh flex-col'>{children}</div>
    </div>
  )
}