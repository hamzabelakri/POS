import { ReactNode } from 'react'

import { CheckIcon, ReceiptTextIcon, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'

export interface FlowStep {
  id: string
  label: string
}

// ---------------------------------------------------------------------------
// Brand mark: swap the icon for your real logo when you have one.
// ---------------------------------------------------------------------------
export const BrandMark = ({ inverted = false }: { inverted?: boolean }) => {
  const { t } = useTranslation()
  return (
    <div className='flex items-center gap-3'>
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-xl',
          inverted
            ? 'bg-white/10 text-white ring-1 ring-white/20 backdrop-blur'
            : 'bg-banner-from text-white shadow-sm'
        )}
      >
        <ReceiptTextIcon className='size-5' />
      </div>
      <span className={cn('font-manrope text-lg font-semibold tracking-tight', inverted && 'text-white')}>
        {t('app_name', 'Point of Sale')}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Receipt: the flow's progress, drawn as a till receipt. The steps are a real
// sequence, so numbering is meaningful here.
// ---------------------------------------------------------------------------
const Receipt = ({ steps, activeStep, completed }: { steps: FlowStep[]; activeStep: number; completed: boolean }) => {
  const { t, i18n } = useTranslation()
  const date = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }).format(new Date())

  return (
    <div className='w-full max-w-sm drop-shadow-2xl'>
      <div className='receipt-edge bg-white px-6 pt-6 pb-9 text-slate-900'>
        <div className='flex items-baseline justify-between text-xs text-slate-500'>
          <span className='font-medium text-slate-900'>{t('app_name', 'Point of Sale')}</span>
          <span className='tabular-nums'>{date}</span>
        </div>

        <ol className='mt-4 border-y border-dashed border-slate-300'>
          {steps.map((step, i) => {
            const done = completed || i < activeStep
            const active = !completed && i === activeStep
            return (
              <li
                key={step.id}
                aria-current={active ? 'step' : undefined}
                className={cn(
                  'flex items-center gap-3 py-3.5 text-sm',
                  i > 0 && 'border-t border-dashed border-slate-200',
                  !done && !active && 'text-slate-400'
                )}
              >
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                    done && 'bg-success text-white',
                    active && 'bg-banner-via text-white',
                    !done && !active && 'border border-slate-300'
                  )}
                >
                  {done ? <CheckIcon className='size-3.5' /> : i + 1}
                </span>
                <span className={cn('flex-1', active && 'font-semibold')}>{step.label}</span>
                {done && <span className='text-xs text-slate-500'>{t('done', 'Done')}</span>}
                {active && <span className='text-xs text-slate-500'>{t('in_progress', 'In progress')}</span>}
              </li>
            )
          })}
        </ol>

        <div className='mt-4 flex items-center justify-between text-xs text-slate-500'>
          <span>{t('step', 'Step')}</span>
          <span className='font-medium text-slate-900 tabular-nums'>
            {completed ? steps.length : activeStep + 1} / {steps.length}
          </span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Compact progress for screens where the brand panel is hidden.
// ---------------------------------------------------------------------------
const MobileProgress = ({ steps, activeStep }: { steps: FlowStep[]; activeStep: number }) => (
  <div className='mb-8 space-y-2 lg:hidden'>
    <div className='text-muted-foreground flex items-center justify-between text-xs'>
      <span className='text-foreground font-medium'>{steps[activeStep]?.label}</span>
      <span className='tabular-nums'>
        {activeStep + 1} / {steps.length}
      </span>
    </div>
    <div
      role='progressbar'
      aria-valuemin={1}
      aria-valuemax={steps.length}
      aria-valuenow={activeStep + 1}
      className='flex gap-1.5'
    >
      {steps.map((step, i) => (
        <span
          key={step.id}
          className={cn('h-1 flex-1 rounded-full transition-colors', i <= activeStep ? 'bg-primary' : 'bg-muted')}
        />
      ))}
    </div>
  </div>
)

// ---------------------------------------------------------------------------
// Page heading used on the form side.
// ---------------------------------------------------------------------------
interface AuthHeadingProps {
  icon?: LucideIcon
  title: string
  description?: string
  tone?: 'default' | 'success'
}

export const AuthHeading = ({ icon: Icon, title, description, tone = 'default' }: AuthHeadingProps) => (
  <div className='space-y-5'>
    {Icon && (
      <div
        className={cn(
          'flex size-12 items-center justify-center rounded-2xl border',
          tone === 'success'
            ? 'border-success/30 bg-success/10 text-success'
            : 'border-primary/20 bg-primary/10 text-primary'
        )}
      >
        <Icon className='size-6' />
      </div>
    )}
    <div className='space-y-2'>
      <h1 className='font-manrope text-2xl font-semibold tracking-tight text-balance sm:text-3xl'>{title}</h1>
      {description && <p className='text-muted-foreground text-sm leading-relaxed text-pretty'>{description}</p>}
    </div>
  </div>
)

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
interface AuthLayoutProps {
  panelTitle: string
  panelDescription: string
  steps: FlowStep[]
  activeStep: number
  /** Marks every step as done (e.g. the final confirmation screen). */
  completed?: boolean
  children: ReactNode
}

export const AuthLayout = ({
  panelTitle,
  panelDescription,
  steps,
  activeStep,
  completed = false,
  children
}: AuthLayoutProps) => {
  const { t } = useTranslation()

  return (
    <div className='bg-background grid min-h-svh lg:grid-cols-[5fr_6fr]'>
      {/* Brand panel */}
      <aside className='from-banner-from via-banner-via to-banner-to relative hidden flex-col justify-between overflow-hidden bg-linear-to-br p-12 text-white lg:flex xl:p-16'>
        <div
          aria-hidden
          className='absolute inset-0 [background-image:radial-gradient(oklch(1_0_0/0.09)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]'
        />
        <div
          aria-hidden
          className='bg-haze-primary-darker/50 absolute -start-32 -bottom-32 size-120 rounded-full blur-3xl'
        />

        <div className='relative'>
          <BrandMark inverted />
        </div>

        <div className='relative space-y-10'>
          <div className='max-w-md space-y-3'>
            <h2 className='font-manrope text-4xl leading-tight font-semibold tracking-tight text-balance xl:text-5xl'>
              {panelTitle}
            </h2>
            <p className='text-base leading-relaxed text-white/70'>{panelDescription}</p>
          </div>
          <Receipt steps={steps} activeStep={activeStep} completed={completed} />
        </div>

        <p className='relative text-xs text-white/50'>
          © {new Date().getFullYear()} {t('app_name', 'Point of Sale')}
        </p>
      </aside>

      {/* Form side */}
      <main className='flex flex-col'>
        <div className='p-6 pb-0 lg:hidden'>
          <BrandMark />
        </div>
        <div className='flex flex-1 items-center justify-center p-6 sm:p-10'>
          <div className='w-full max-w-sm'>
            <MobileProgress steps={steps} activeStep={activeStep} />
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}