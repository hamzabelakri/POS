import { CheckIcon } from 'lucide-react'
import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

export type SetupStep = { id: string; title: string; description?: string }

type Tone = 'default' | 'inverse'

const tones = {
  default: {
    done: 'bg-primary text-primary-foreground',
    active: 'bg-primary text-primary-foreground',
    todo: 'bg-secondary text-muted-foreground',
    lineDone: 'bg-primary',
    lineTodo: 'bg-secondary',
    labelActive: 'text-primary',
    labelDone: 'text-muted-foreground',
    labelTodo: 'text-muted-foreground/60',
    description: 'text-muted-foreground',
  },
  inverse: {
    done: 'bg-white text-panel',
    active: 'bg-white text-panel',
    todo: 'bg-white/10 text-white/50',
    lineDone: 'bg-white/70',
    lineTodo: 'bg-white/15',
    labelActive: 'text-white',
    labelDone: 'text-white/80',
    labelTodo: 'text-white/50',
    description: 'text-white/60',
  },
} satisfies Record<Tone, Record<string, string>>

type Props = {
  steps: SetupStep[]
  current: string
  finished?: boolean
  orientation?: 'horizontal' | 'vertical'
  tone?: Tone
  uppercaseLabels?: boolean
  className?: string
}

/* ------------------------- chevron geometry ------------------------- */
const ARROW = 16
const GAP = 4

function chevronClip(isFirst: boolean, isLast: boolean): string {
  const left = isFirst ? '0 0' : `${ARROW}px 50%`
  const leftTop = '0 0'
  const leftBottom = '0 100%'
  const right = isLast ? '100% 50%' : `100% 50%`
  const rightTop = isLast ? '100% 0' : `calc(100% - ${ARROW}px) 0`
  const rightBottom = isLast ? '100% 100%' : `calc(100% - ${ARROW}px) 100%`
  if (isFirst && isLast) return 'none'
  if (isFirst)
    return `polygon(${leftTop}, ${rightTop}, ${right}, ${rightBottom}, ${leftBottom})`
  if (isLast)
    return `polygon(${leftTop}, 100% 0, 100% 100%, ${leftBottom}, ${left})`
  return `polygon(${leftTop}, ${rightTop}, ${right}, ${rightBottom}, ${leftBottom}, ${left})`
}

/* ------------------------------ stepper ------------------------------ */
export function SetupStepper({
  steps,
  current,
  finished = false,
  orientation = 'horizontal',
  tone = 'default',
  className,
}: Props) {
  const t = tones[tone]
  const currentIndex = steps.findIndex(s => s.id === current)
  const last = steps.length - 1

  const status = (i: number): 'done' | 'active' | 'todo' =>
    finished || i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'todo'

  /* ---- vertical variant (kept for your brand panel) ---- */
  if (orientation === 'vertical') {
    const circle = (i: number) => (
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300',
          status(i) === 'done' && t.done,
          status(i) === 'active' && `${t.active} ring-4 ring-white/15`,
          status(i) === 'todo' && `border-transparent ${t.todo}`
        )}
      >
        {status(i) === 'done' ? <CheckIcon className='size-4' strokeWidth={3} /> : i + 1}
      </span>
    )

    return (
      <ol aria-label='Setup progress' className={cn('flex flex-col', className)}>
        {steps.map((step, i) => (
          <li
            key={step.id}
            aria-current={status(i) === 'active' ? 'step' : undefined}
            className='flex gap-4'
          >
            <div className='flex flex-col items-center'>
              {circle(i)}
              {i < last && (
                <span
                  aria-hidden
                  className={cn(
                    'my-1.5 min-h-8 w-0.5 flex-1 rounded-full transition-colors duration-500',
                    status(i) === 'done' ? t.lineDone : t.lineTodo
                  )}
                />
              )}
            </div>
            <div className={cn('pb-7', i === last && 'pb-0')}>
              <p
                className={cn(
                  'text-sm leading-8 font-semibold transition-colors',
                  status(i) === 'done' && t.labelDone,
                  status(i) === 'active' && t.labelActive,
                  status(i) === 'todo' && t.labelTodo
                )}
              >
                {step.title}
              </p>
              {step.description && (
                <p className={cn('text-sm', t.description)}>{step.description}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    )
  }

  /* ---- horizontal chevron variant (card header) ---- */
  return (
    <ol aria-label='Setup progress' className={cn('flex w-full', className)}>
      {steps.map((step, i) => {
        const isFirst = i === 0
        const isLast = i === last
        const s = status(i)

        const style: CSSProperties = {
          clipPath: chevronClip(isFirst, isLast),
          paddingLeft: isFirst ? 16 : ARROW + 8,
          paddingRight: isLast ? 16 : ARROW + 4,
        }

        return (
          <li
            key={step.id}
            aria-current={s === 'active' ? 'step' : undefined}
            className='relative min-w-0 flex-1'
            style={{ marginLeft: isFirst ? 0 : -(ARROW - GAP), zIndex: steps.length - i }}
          >
            <div
              style={style}
              className={cn(
                'flex h-14 w-full items-center justify-center gap-2.5 text-sm font-medium transition-colors duration-300',
                s === 'done' && t.done,
                s === 'active' && t.active,
                s === 'todo' && t.todo
              )}
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  s === 'done' && 'bg-white/20 text-current',
                  s === 'active' && 'bg-white text-current',
                  s === 'todo' && 'bg-foreground/10 text-current'
                )}
              >
                {s === 'done' ? <CheckIcon className='size-3.5' strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn('truncate', s !== 'active' && 'hidden sm:inline')}>
                {step.title}
              </span>
            </div>
          </li>
        )
      })}
    </ol>
  )
}