import { useState, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const SENSITIVE = /(password|api_key|token)/i
const humanize = (key: string) => key.replace(/_/g, ' ')

export type Entry = [key: string, value: unknown]

/** Primitive fields only; nested arrays/objects are skipped. */
export function primitiveEntries(data: object, omit: string[] = []): Entry[] {
  return Object.entries(data).filter(
    ([key, value]) =>
      !omit.includes(key) && (value === null || typeof value !== 'object')
  )
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type='button'
      aria-label={label}
      title={label}
      onClick={onClick}
      className='text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex size-7 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none'
    >
      {children}
    </button>
  )
}

function FieldRow({ name, value }: { name: string; value: unknown }) {
  const { t } = useTranslation()
  const [revealed, setRevealed] = useState(false)

  const text = value === null || value === undefined ? '' : String(value)
  const secret = SENSITIVE.test(name)
  const multiline = text.includes('\n')
  const technical = secret || multiline || /^https?:\/\//.test(text)

  let display: ReactNode
  if (text === '') {
    display = (
      <span className='text-muted-foreground/70 text-sm'>
        {t('not_set', 'Not set')}
      </span>
    )
  } else if (typeof value === 'boolean') {
    display = (
      <span className='inline-flex items-center gap-2 text-sm'>
        <span
          className={cn(
            'size-2 rounded-full',
            value ? 'bg-success' : 'bg-muted-foreground/40'
          )}
          aria-hidden='true'
        />
        {value ? t('yes', 'Yes') : t('no', 'No')}
      </span>
    )
  } else if (multiline) {
    display = (
      <pre className='bg-muted/60 max-h-64 overflow-auto rounded-md border p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap'>
        {text}
      </pre>
    )
  } else {
    display = (
      <span
        className={cn(
          'text-sm break-all tabular-nums',
          technical && 'font-mono text-[13px]'
        )}
      >
        {secret && !revealed ? '•'.repeat(Math.min(text.length, 14)) : text}
      </span>
    )
  }

  return (
    <div
      className={cn(
        'border-border space-y-1 border-r border-b px-4 py-3',
        multiline && 'sm:col-span-full'
      )}
    >
      <dt className='text-muted-foreground text-xs first-letter:uppercase'>
        {t(name, humanize(name))}
      </dt>
      <dd className='flex min-w-0 items-start justify-between gap-2'>
        <div className='min-w-0 flex-1'>{display}</div>
        {secret && (
          <div className='flex shrink-0 items-center'>
            <IconButton
              label={revealed ? t('hide', 'Hide') : t('show', 'Show')}
              onClick={() => setRevealed((v) => !v)}
            >
              {revealed ? (
                <EyeOff className='size-3.5' aria-hidden='true' />
              ) : (
                <Eye className='size-3.5' aria-hidden='true' />
              )}
            </IconButton>
          </div>
        )}
      </dd>
    </div>
  )
}

export function Section({
  title,
  data,
  omit = [],
  query = '',
  columns = 2,
}: {
  title: string
  data: object
  omit?: string[]
  query?: string
  /** 2 = two columns from the sm breakpoint up; 1 = always a single column. */
  columns?: 1 | 2
}) {
  const { t } = useTranslation()
  const q = query.trim().toLowerCase()

  const entries = primitiveEntries(data, omit).filter(([key, value]) => {
    if (!q) return true
    const label = t(key, humanize(key)).toLowerCase()
    const haystack = SENSITIVE.test(key) ? '' : String(value ?? '').toLowerCase()
    return label.includes(q) || haystack.includes(q)
  })

  return (
    <section className='bg-card overflow-hidden rounded-xl border'>
      <header className='flex items-baseline justify-between border-b px-4 py-3'>
        <h3 className='font-manrope font-semibold'>{title}</h3>
        <span className='text-muted-foreground text-xs tabular-nums'>
          {entries.length}
        </span>
      </header>
      {entries.length === 0 ? (
        <p className='text-muted-foreground px-4 py-6 text-sm'>
          {t('no_settings_match_search')}
        </p>
      ) : (
        // Negative margins hide the outer-edge borders of the last row/column.
        <dl
          className={cn(
            '-mr-px -mb-px grid grid-cols-1',
            columns === 2 && 'sm:grid-cols-2'
          )}
        >
          {entries.map(([key, value]) => (
            <FieldRow key={key} name={key} value={value} />
          ))}
        </dl>
      )}
    </section>
  )
}