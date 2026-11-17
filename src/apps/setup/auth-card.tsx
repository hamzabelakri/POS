import { ReactNode } from 'react'

import { CheckIcon, StoreIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

export interface AuthStep {
  id: string
  title: string
}

interface AuthCardProps {
  title: string
  description?: string
  children: ReactNode
  // Optional: shows a vertical progress list in the side panel (used by POS setup).
  steps?: AuthStep[]
  currentStep?: string
}

// Shared split-screen shell for every pre-app page (setup, sign-in, start shift).
// Uses logical properties (start/end, ps/pe) so it works in LTR and RTL.
export function AuthCard({ title, description, children, steps, currentStep }: AuthCardProps) {
  const { t } = useTranslation()
  const currentIndex = steps?.findIndex(s => s.id === currentStep) ?? -1

  return (
    <div className='bg-background grid min-h-svh lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]'>
      {/* Brand panel */}
      <aside className='bg-primary text-primary-foreground relative hidden flex-col justify-between overflow-hidden p-10 lg:flex'>
        {/* Dot grid, faded toward the bottom */}
        <div
          aria-hidden
          className='absolute inset-0 opacity-20 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]'
        />
        <div className='relative flex items-center gap-3'>
          <div className='bg-primary-foreground/15 flex size-10 items-center justify-center rounded-xl'>
            <StoreIcon className='size-5' />
          </div>
          <span className='text-lg font-semibold tracking-tight'>{t('app_name')}</span>
        </div>

        <div className='relative max-w-md space-y-8'>
          <h2 className='text-4xl leading-tight font-semibold tracking-tight text-balance'>
            {t('auth_tagline')}
          </h2>

          {steps && (
            <ol className='space-y-0'>
              {steps.map((step, i) => {
                const done = i < currentIndex
                const active = i === currentIndex
                return (
                  <li key={step.id} className='relative flex items-center gap-4 pb-6 last:pb-0'>
                    {i < steps.length - 1 && (
                      <span
                        aria-hidden
                        className={cn(
                          'absolute start-4 top-8 h-[calc(100%-2rem)] w-px -translate-x-1/2 rtl:translate-x-1/2',
                          done ? 'bg-primary-foreground' : 'bg-primary-foreground/25'
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium transition-colors',
                        done && 'bg-primary-foreground text-primary border-transparent',
                        active && 'border-primary-foreground ring-primary-foreground/30 ring-4',
                        !done && !active && 'border-primary-foreground/30 text-primary-foreground/60'
                      )}
                    >
                      {done ? <CheckIcon className='size-4' /> : i + 1}
                    </span>
                    <span
                      className={cn('text-sm', active ? 'font-medium' : 'text-primary-foreground/70')}
                      aria-current={active ? 'step' : undefined}
                    >
                      {step.title}
                    </span>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        <p className='text-primary-foreground/60 relative text-xs'>
          © {new Date().getFullYear()} {t('app_name')}
        </p>
      </aside>

      {/* Form panel */}
      <main className='flex items-center justify-center p-6 sm:p-10'>
        <div className={cn('w-full space-y-8', steps ? 'max-w-lg' : 'max-w-sm')}>
          {/* Compact brand mark on small screens, where the side panel is hidden */}
          <div className='flex items-center gap-2 lg:hidden'>
            <div className='bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg'>
              <StoreIcon className='size-4' />
            </div>
            <span className='font-semibold'>{t('app_name')}</span>
          </div>

          <div className='space-y-2'>
            <h1 className='text-3xl font-semibold tracking-tight'>{title}</h1>
            {description && <p className='text-muted-foreground'>{description}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}