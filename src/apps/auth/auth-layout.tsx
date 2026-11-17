import type { ReactNode } from 'react'

// Bundled with the app at public/images/background.jpg and public/images/logo.svg.
const BACKGROUND_URL = `${import.meta.env.BASE_URL}images/background.jpg`
const LOGO_URL = `${import.meta.env.BASE_URL}images/logo.svg`

interface AuthLayoutProps {
  children: ReactNode
}

// Split-screen shell shared by every pre-app page (setup, sign-in, start shift).
// It owns the left panel only; each page renders its own right-hand column.
export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='grid min-h-svh w-full lg:grid-cols-2'>
      <aside
        className='relative hidden bg-cover bg-center bg-no-repeat lg:block dark:border-r'
        style={{ backgroundImage: `url('${BACKGROUND_URL}')` }}
      >
        <div aria-hidden className='absolute inset-0 bg-black/40' />

        <div className='relative flex h-full flex-col justify-between p-10'>
          {/* Logo only at the top, texts removed */}
          <div className='flex items-center'>
            <img src={LOGO_URL} alt='Logo' className='h-8 w-auto object-contain' />
          </div>

          {/* Empty spacer divs to maintain flex distribution if needed */}
          <div />
          <div />
        </div>
      </aside>

      <div className='bg-background flex min-h-svh flex-col'>{children}</div>
    </div>
  )
}