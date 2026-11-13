import { CheckIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

export type SetupStep = { id: string; title: string; description?: string }

type Tone = 'default' | 'inverse'

const tones = {
  default: {
    done: 'border-brand bg-brand text-brand-foreground',
    active: 'border-brand bg-brand/10 text-brand-soft ring-4 ring-brand/15',
    todo: 'border-transparent bg-secondary text-muted-foreground',
    lineDone: 'bg-brand',
    lineTodo: 'bg-secondary',
    labelActive: 'text-brand-soft',
    labelDone: 'text-muted-foreground',
    labelTodo: 'text-muted-foreground/60',
    description: 'text-muted-foreground'
  },
  // For use on the dark banner gradient
  inverse: {
    done: 'border-white bg-white text-[color:var(--banner-via)]',
    active: 'border-white bg-white/10 text-white ring-4 ring-white/15',
    todo: 'border-white/20 bg-transparent text-white/50',
    lineDone: 'bg-white/70',
    lineTodo: 'bg-white/15',
    labelActive: 'text-white',
    labelDone: 'text-white/80',
    labelTodo: 'text-white/50',
    description: 'text-white/60'
  }
} satisfies Record<Tone, Record<string, string>>

type Props = {
  steps: SetupStep[]
  current: string
  /** Marks every step as completed (e.g. once the last step is reached and succeeded) */
  finished?: boolean
  orientation?: 'horizontal' | 'vertical'
  tone?: Tone
  uppercaseLabels?: boolean
  className?: string
}

export function SetupStepper({
  steps,
  current,
  finished = false,
  orientation = 'horizontal',
  tone = 'default',
  uppercaseLabels = false,
  className
}: Props) {
  const t = tones[tone]
  const currentIndex = steps.findIndex(s => s.id === current)
  const last = steps.length - 1

  const status = (i: number) => (finished || i < currentIndex ? 'done' : i === currentIndex ? 'active' : 'todo')
  const labelColor = (i: number) =>
    ({ done: t.labelDone, active: t.labelActive, todo: t.labelTodo })[status(i)]

  const Circle = ({ i }: { i: number }) => (
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300',
        t[status(i)]
      )}
    >
      {status(i) === 'done' ? <CheckIcon className='size-4' strokeWidth={3} /> : i + 1}
    </span>
  )

  if (orientation === 'vertical') {
    return (
      <ol aria-label='Setup progress' className={cn('flex flex-col', className)}>
        {steps.map((step, i) => (
          <li key={step.id} aria-current={status(i) === 'active' ? 'step' : undefined} className='flex gap-4'>
            <div className='flex flex-col items-center'>
              <Circle i={i} />
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
              <p className={cn('text-sm leading-8 font-semibold transition-colors', labelColor(i))}>{step.title}</p>
              {step.description && <p className={cn('text-sm', t.description)}>{step.description}</p>}
            </div>
          </li>
        ))}
      </ol>
    )
  }

  return (
    <ol aria-label='Setup progress' className={cn('flex items-start justify-center', className)}>
      {steps.map((step, i) => (
        <li key={step.id} aria-current={status(i) === 'active' ? 'step' : undefined} className='flex items-start'>
          <div className='flex w-16 flex-col items-center gap-2 sm:w-20'>
            <Circle i={i} />
            <span
              className={cn(
                'text-[11px] font-semibold transition-colors',
                uppercaseLabels && 'tracking-wide uppercase',
                labelColor(i)
              )}
            >
              {step.title}
            </span>
          </div>
          {i < last && (
            <span
              aria-hidden
              className={cn(
                'mt-[15px] h-0.5 w-4 shrink-0 rounded-full transition-colors duration-500 sm:w-12',
                status(i) === 'done' ? t.lineDone : t.lineTodo
              )}
            />
          )}
        </li>
      ))}
    </ol>
  )
}