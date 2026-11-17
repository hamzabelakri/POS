import type { CSSProperties } from 'react'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { useDirection } from '@/context/direction-provider'

export interface StepperStep {
  id: string
  title: string
}

interface ChevronStepperProps {
  steps: readonly StepperStep[]
  current: number
  onSelect: (index: number) => void
}

const ARROW = 16
const GAP = 4

// Builds the polygon for one chevron segment supporting both LTR and RTL directions.
function chevronClip(isFirst: boolean, isLast: boolean, isRtl: boolean): string {
  if (isFirst && isLast) return 'none'

  if (isRtl) {
    // In RTL, chevrons point left and notch on the right
    const leftTop = isLast ? '0 0' : `${ARROW}px 0`
    const leftBottom = isLast ? '0 100%' : `${ARROW}px 100%`

    const points = ['100% 0', leftTop]
    if (!isLast) points.push('0 50%')
    points.push(leftBottom, '100% 100%')
    if (!isFirst) points.push(`calc(100% - ${ARROW}px) 50%`)

    return `polygon(${points.join(', ')})`
  }

  // LTR polygon
  const rightTop = isLast ? '100% 0' : `calc(100% - ${ARROW}px) 0`
  const rightBottom = isLast ? '100% 100%' : `calc(100% - ${ARROW}px) 100%`

  const points = ['0 0', rightTop]
  if (!isLast) points.push('100% 50%')
  points.push(rightBottom, '0 100%')
  if (!isFirst) points.push(`${ARROW}px 50%`)

  return `polygon(${points.join(', ')})`
}

export function SetupStepper({ steps, current, onSelect }: ChevronStepperProps) {
  const { t } = useTranslation()
  const { dir } = useDirection()
  const isRtl = dir === 'rtl'

  return (
    <ol className='flex w-full' aria-label={t('setup_progress')} dir={dir}>
      {steps.map((step, i) => {
        const isFirst = i === 0
        const isLast = i === steps.length - 1
        // The last step is "done" as soon as is reached: it is the final confirmation.
        const done = i < current || (isLast && current === i)
        const active = i === current && !isLast
        
        // Highlight both completed and current steps with the active theme color
        const isHighlighted = done || active

        const content = (
          <>
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300',
                isHighlighted && 'bg-white/20 text-white',
                !isHighlighted && 'bg-foreground/10 text-muted-foreground'
              )}
            >
              {done ? <Check className='h-3.5 w-3.5' strokeWidth={3} /> : i + 1}
            </span>
            <span className={cn('truncate', !active && 'hidden sm:inline')}>{step.title}</span>
          </>
        )

        const className = cn(
          'flex h-14 w-full items-center justify-center gap-2.5 text-sm font-medium transition-colors duration-300',
          isHighlighted && 'bg-[#0E1B2C] text-white hover:bg-[#16283F]',
          !isHighlighted && 'bg-muted text-muted-foreground'
        )

        // Mirror padding rules for RTL so text stays centered inside the chevron shape
        const style: CSSProperties = {
          clipPath: chevronClip(isFirst, isLast, isRtl),
          paddingRight: isRtl ? (isFirst ? 16 : ARROW + 8) : (isLast ? 16 : ARROW + 4),
          paddingLeft: isRtl ? (isLast ? 16 : ARROW + 4) : (isFirst ? 16 : ARROW + 8),
        }

        return (
          <li
            key={step.id}
            className='relative min-w-0 flex-1'
            style={{ 
              [isRtl ? 'marginRight' : 'marginLeft']: isFirst ? 0 : -(ARROW - GAP), 
              zIndex: steps.length - i 
            }}
            aria-current={active ? 'step' : undefined}
          >
            {done && !isLast ? (
              <button
                type='button'
                onClick={() => onSelect(i)}
                className={cn(
                  className,
                  'focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset'
                )}
                style={style}
              >
                {content}
                <span className='sr-only'>{t('step_completed_go_back')}</span>
              </button>
            ) : (
              <div className={className} style={style}>
                {content}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}