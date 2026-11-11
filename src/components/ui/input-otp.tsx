import * as React from 'react'
import { OTPInput, OTPInputContext } from 'input-otp'
import { MinusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'


function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  return (
    <OTPInput
      data-slot='input-otp'
      containerClassName={cn(
        'flex items-center gap-2 has-disabled:opacity-50',
        containerClassName
      )}
      className={cn('disabled:cursor-not-allowed', className)}
      {...props}
    />
  )
}

function InputOTPGroup({
  className,
  separated,
  ...props
}: React.ComponentProps<'div'> & { separated?: boolean }) {
  return (
    <div
      data-slot='input-otp-group'
      className={cn(
        'flex items-center',
        separated && 'gap-2',
        className
      )}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  separated,
  ...props
}: React.ComponentProps<'div'> & {
  index: number
  separated?: boolean
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot='input-otp-slot'
      data-active={isActive}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center text-sm shadow-xs transition-all outline-none aria-invalid:border-destructive data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-[3px] data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:bg-input/30 dark:data-[active=true]:aria-invalid:ring-destructive/40',
        separated
          ? 'rounded-md border border-input'
          : 'border-y border-r border-input first:rounded-l-md first:border-l last:rounded-r-md',
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
          <div className='h-4 w-px animate-caret-blink bg-foreground duration-1000' />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot='input-otp-separator' role='separator' {...props}>
      <MinusIcon />
    </div>
  )
}


// 2. add below InputOTPSeparator

// '' = empty slot. Gaps are stored as ' ' in the string value.
const toSlots = (value: string, length: number) => {
  const chars = [...(value ?? '')]
  return Array.from({ length }, (_, i) =>
    chars[i] && chars[i] !== ' ' ? chars[i] : ''
  )
}
const toValue = (slots: string[]) =>
  slots
    .map((c) => c || ' ')
    .join('')
    .trimEnd()

// Remove slot i and shift the following slots left
const removeAt = (slots: string[], i: number) => [
  ...slots.slice(0, i),
  ...slots.slice(i + 1),
  '',
]

interface LpnInputProps
  extends Omit<React.ComponentProps<'div'>, 'onChange' | 'children'> {
  value: string
  onChange?: (value: string) => void
  length?: number
  disabled?: boolean
  sanitize?: (value: string) => string
  slotClassName?: string
}

function LpnInput({
  value,
  onChange,
  length = 8,
  disabled,
  sanitize,
  className,
  slotClassName,
  ...props
}: LpnInputProps) {
  const refs = React.useRef<(HTMLInputElement | null)[]>([])
  const slots = toSlots(value, length)
  const locked = disabled || !onChange

  const focusSlot = (i: number) =>
    refs.current[Math.max(0, Math.min(length - 1, i))]?.focus()

  const commit = (next: string[]) => onChange?.(toValue(next))
  const clean = (s: string) => (sanitize ? sanitize(s) : s)

  const put = (i: number, raw: string) => {
    const ch = [...clean(raw)][0]
    if (!ch) return
    const next = [...slots]
    next[i] = ch
    commit(next)
    focusSlot(i + 1)
  }

  const handleKeyDown =
    (i: number) => (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (locked) return

      switch (e.key) {
        case 'Backspace':
          e.preventDefault()
          if (slots[i]) {
            commit(removeAt(slots, i))
          } else if (i > 0) {
            commit(removeAt(slots, i - 1))
            focusSlot(i - 1)
          }
          return
        case 'Delete':
          e.preventDefault()
          commit(removeAt(slots, i))
          return
        case 'ArrowLeft':
          e.preventDefault()
          return focusSlot(i - 1)
        case 'ArrowRight':
          e.preventDefault()
          return focusSlot(i + 1)
        case 'Home':
          e.preventDefault()
          return focusSlot(0)
        case 'End':
          e.preventDefault()
          return focusSlot(length - 1)
        case ' ': {
          e.preventDefault()
          const next = [...slots]
          next[i] = ''
          commit(next)
          return focusSlot(i + 1)
        }
      }

      // Printable character (desktop path)
      if ([...e.key].length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        put(i, e.key)
      }
    }

  // Fallback for mobile/IME keyboards where keydown gives no usable key
  const handleChange =
    (i: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      if (locked) return
      const chars = [...e.target.value]
      if (chars.length === 0) return commit(removeAt(slots, i))
      put(i, chars.filter((c) => c !== slots[i]).pop() ?? chars[chars.length - 1])
    }

  const handlePaste =
    (i: number) => (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (locked) return
      e.preventDefault()
      const pasted = [
        ...clean(e.clipboardData.getData('text').replace(/\s/g, '')),
      ]
      if (!pasted.length) return
      const next = [...slots]
      pasted.slice(0, length - i).forEach((c, k) => (next[i + k] = c))
      commit(next)
      focusSlot(i + pasted.length)
    }

  return (
    // dir='ltr' keeps slot order and arrow keys consistent in RTL layouts
    <div
      dir='ltr'
      role='group'
      data-slot='lpn-input'
      className={cn(
        'group flex items-center gap-1.5 has-disabled:opacity-50',
        className
      )}
      {...props}
    >
      {slots.map((char, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          data-slot='lpn-input-slot'
          value={char}
          disabled={disabled}
          readOnly={!onChange}
          autoComplete='off'
          aria-label={`${i + 1} / ${length}`}
          onChange={handleChange(i)}
          onKeyDown={handleKeyDown(i)}
          onPaste={handlePaste(i)}
          onFocus={(e) => e.currentTarget.select()}
          onClick={(e) => e.currentTarget.select()}
          className={cn(
            'border-input h-9 w-9 rounded-md border bg-transparent text-center text-sm shadow-xs transition-all outline-none',
            'focus:border-ring focus:ring-ring/50 focus:z-10 focus:ring-[3px]',
            'group-aria-invalid:border-destructive group-aria-invalid:focus:border-destructive group-aria-invalid:focus:ring-destructive/20',
            'dark:bg-input/30 dark:group-aria-invalid:focus:ring-destructive/40',
            'disabled:cursor-not-allowed',
            slotClassName
          )}
        />
      ))}
    </div>
  )
}


export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator, LpnInput }